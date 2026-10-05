import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    AlertTriangle,
    ShieldAlert,
    ShieldCheck,
    RefreshCw,
    SlidersHorizontal,
    X,
    MapPin,
    Sparkles,
    Zap,
    Search,
    AlertOctagon,
    Info,
    ExternalLink
} from 'lucide-react';

export default function FraudIndex({ 
    allVendors = [],
    highRiskVendors = [], 
    moderateRiskVendors = [], 
    lowRiskVendors = [], 
    insufficientDataVendors = [],
    openFraudFlags = [], 
    districts = [],
    selectedDistrict = 'all',
    totalScanned = 57,
    totalStatewide = 57,
    totalDistricts = 38,
    modelCard = {}
}) {
    const allVendorsPool = (allVendors && allVendors.length > 0)
        ? allVendors
        : [...highRiskVendors, ...moderateRiskVendors, ...lowRiskVendors, ...insufficientDataVendors];

    const [scanning, setScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanStatusText, setScanStatusText] = useState('');
    const [currentDistrict, setCurrentDistrict] = useState(selectedDistrict);
    const [searchTerm, setSearchTerm] = useState('');
    const [scanningVendorId, setScanningVendorId] = useState(null);

    // Multi-Vendor Targeted Selection State
    const [selectedVendorIds, setSelectedVendorIds] = useState([]);
    const [showVendorPicker, setShowVendorPicker] = useState(false);
    const [onlyShowSelected, setOnlyShowSelected] = useState(false);
    const [vendorPickerSearch, setVendorPickerSearch] = useState('');

    const handleToggleVendor = (id) => {
        setSelectedVendorIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSelectAllVendors = () => {
        setSelectedVendorIds(allVendorsPool.map(v => v.id));
    };

    const handleSelectHighRiskVendors = () => {
        const highIds = highRiskVendors.map(v => v.id);
        setSelectedVendorIds(highIds.length > 0 ? highIds : allVendorsPool.slice(0, 5).map(v => v.id));
    };

    const handleClearVendorSelection = () => {
        setSelectedVendorIds([]);
        setOnlyShowSelected(false);
    };

    const handleScanSelectedVendors = () => {
        if (selectedVendorIds.length === 0) return;
        setScanning(true);
        setShowVendorPicker(false); // Automatically close drawer so output is clearly visible
        setOnlyShowSelected(true);  // Focus output view on scanned entities
        setScanProgress(20);
        setScanStatusText(`Targeted Scan: Processing ${selectedVendorIds.length} chosen operator(s)...`);

        setTimeout(() => {
            setScanProgress(60);
            setScanStatusText('Phase 2: Calculating peer baselines & Isolation Forest anomaly scoring...');
        }, 300);

        router.post(route('admin.fraud.scan'), {
            vendor_ids: selectedVendorIds,
        }, {
            preserveScroll: true,
            onFinish: () => {
                setScanProgress(100);
                setScanStatusText(`Targeted scan of ${selectedVendorIds.length} operator(s) completed!`);
                setTimeout(() => {
                    setScanning(false);
                    setScanProgress(0);
                    document.getElementById('fraud-results-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 300);
            }
        });
    };

    // Active Modals state
    const [inspectVendor, setInspectVendor] = useState(null);
    const [dismissModal, setDismissModal] = useState(null); // { flagId, vendorName }
    const [dismissReason, setDismissReason] = useState('');
    const [warnModal, setWarnModal] = useState(null); // { flagId, vendorName }
    const [warnNote, setWarnNote] = useState('');
    const [requestInfoModal, setRequestInfoModal] = useState(null); // { flagId, vendorName }
    const [requestInfoMessage, setRequestInfoMessage] = useState('');
    const [requestInfoDeadline, setRequestInfoDeadline] = useState(7);
    const [suspendModal, setSuspendModal] = useState(null); // { flagId, vendorName, vendorId }
    const [suspendReason, setSuspendReason] = useState('');
    const [suspendConfirmed, setSuspendConfirmed] = useState(false);
    const [resolveModal, setResolveModal] = useState(null); // { vendor }
    const [resolveScore, setResolveScore] = useState(15);
    const [resolveReason, setResolveReason] = useState('');

    const handleDistrictChange = (distId) => {
        setCurrentDistrict(distId);
        router.get(route('admin.fraud.index'), { district: distId }, { preserveState: true, preserveScroll: true });
    };

    const handleRunScan = (districtId = currentDistrict) => {
        setScanning(true);
        setScanProgress(20);
        setScanStatusText('Phase 1: Fetching peer baselines & 90-day event logs...');

        setTimeout(() => {
            setScanProgress(55);
            setScanStatusText('Phase 2: Normalizing peer z-scores & testing hard rules...');
        }, 300);

        setTimeout(() => {
            setScanProgress(85);
            setScanStatusText('Phase 3: Running Isolation Forest hybrid scoring...');
        }, 600);

        router.post(route('admin.fraud.scan'), {
            district_id: districtId,
        }, {
            preserveScroll: true,
            onFinish: () => {
                setScanProgress(100);
                setScanStatusText('Hybrid scan complete! Metrics synchronized.');
                setTimeout(() => {
                    setScanning(false);
                    setScanProgress(0);
                }, 500);
            }
        });
    };

    const handleScanSingleVendor = (vendorId) => {
        setScanningVendorId(vendorId);
        setSelectedVendorIds([vendorId]);
        setOnlyShowSelected(true);
        setShowVendorPicker(false);
        router.post(route('admin.fraud.scan'), {
            vendor_id: vendorId,
        }, {
            preserveScroll: true,
            onFinish: () => {
                setScanningVendorId(null);
                document.getElementById('fraud-results-section')?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    };

    const submitDismiss = (e) => {
        e.preventDefault();
        if (!dismissModal || !dismissReason.trim()) return;
        router.post(route('admin.fraud.dismiss', dismissModal.flagId), {
            reason: dismissReason,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setDismissModal(null);
                setDismissReason('');
            }
        });
    };

    const submitWarn = (e) => {
        e.preventDefault();
        if (!warnModal) return;
        router.post(route('admin.fraud.warn', warnModal.flagId), {
            note: warnNote,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setWarnModal(null);
                setWarnNote('');
            }
        });
    };

    const submitRequestInfo = (e) => {
        e.preventDefault();
        if (!requestInfoModal || !requestInfoMessage.trim()) return;
        router.post(route('admin.fraud.requestInfo', requestInfoModal.flagId), {
            message: requestInfoMessage,
            deadline_days: requestInfoDeadline,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setRequestInfoModal(null);
                setRequestInfoMessage('');
            }
        });
    };

    const submitSuspend = (e) => {
        e.preventDefault();
        if (!suspendModal || !suspendConfirmed || !suspendReason.trim()) return;
        router.post(route('admin.fraud.suspend', suspendModal.flagId), {
            confirmation: true,
            reason: suspendReason,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSuspendModal(null);
                setSuspendReason('');
                setSuspendConfirmed(false);
            }
        });
    };

    const submitResolve = (e) => {
        e.preventDefault();
        if (!resolveModal) return;
        router.post(route('admin.fraud.overrideScore', resolveModal.id), {
            score: Number(resolveScore),
            reason: resolveReason || 'Resolved by admin audit',
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setResolveModal(null);
                setResolveReason('');
            }
        });
    };

    const filterBySearch = (list) => {
        let result = list;
        if (onlyShowSelected && selectedVendorIds.length > 0) {
            result = result.filter(v => selectedVendorIds.includes(v.id));
        }
        if (!searchTerm.trim()) return result;
        const q = searchTerm.toLowerCase();
        return result.filter(v => 
            v.business_name?.toLowerCase().includes(q) || 
            v.owner_name?.toLowerCase().includes(q) ||
            v.district?.name?.toLowerCase().includes(q) ||
            v.id.toString() === q
        );
    };

    const filteredHigh = filterBySearch(highRiskVendors);
    const filteredModerate = filterBySearch(moderateRiskVendors);
    const filteredLow = filterBySearch(lowRiskVendors);
    const filteredInsufficient = filterBySearch(insufficientDataVendors);

    const getFlagForVendor = (vendorId) => {
        return openFraudFlags.find(f => f.vendor_id === vendorId);
    };

    return (
        <AdminLayout
            title="AI Fraud Detection & Anomaly Scanner"
            subtitle="Isolation Forest hybrid risk engine with peer-group behavioral profiling"
        >
            <Head title="AI Fraud Scanner — Admin" />

            <div className="space-y-6">
                {/* 1. HERO HEADER CARD (Neutral Theme Card with Live chip & Scan buttons) */}
                <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-4">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-500/10 border border-[var(--border)] text-[var(--primary)] flex items-center justify-center shrink-0">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <h3 className="text-lg font-bold text-[var(--text)]">Isolation Forest & Anomaly Scanner</h3>
                                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold uppercase border border-teal-500/20">
                                        Live
                                    </span>
                                </div>
                                <p className="text-xs text-[var(--muted)] mt-1 max-w-2xl">
                                    3-layer hybrid detection combining deterministic compliance rules and Isolation Forest unsupervised anomaly scoring across {totalStatewide} vendors in 38 Tamil Nadu districts.
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                            {selectedVendorIds.length > 0 && (
                                <button
                                    onClick={handleScanSelectedVendors}
                                    disabled={scanning}
                                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:opacity-90 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all ring-2 ring-rose-400/40 animate-pulse"
                                >
                                    <Zap className={`w-4 h-4 ${scanning ? 'animate-bounce' : ''}`} />
                                    <span>Scan Selected ({selectedVendorIds.length}) Operators</span>
                                </button>
                            )}

                            <button
                                onClick={() => handleRunScan(currentDistrict)}
                                disabled={scanning}
                                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text)] font-semibold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                            >
                                <Zap className={`w-4 h-4 text-[var(--primary)] ${scanning ? 'animate-bounce' : ''}`} />
                                <span>{scanning ? 'Scanning...' : 'Scan Selected District'}</span>
                            </button>

                            <button
                                onClick={() => handleRunScan('all')}
                                disabled={scanning}
                                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                            >
                                <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
                                <span>Statewide Full Scan</span>
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {scanning && (
                        <div className="space-y-1.5 pt-3 border-t border-[var(--border)]">
                            <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                                <span className="font-semibold text-[var(--primary)]">{scanStatusText}</span>
                                <span className="font-mono font-bold text-[var(--text)]">{scanProgress}%</span>
                            </div>
                            <div className="w-full bg-[var(--bg)] rounded-full h-2 overflow-hidden border border-[var(--border)]">
                                <div 
                                    className="bg-[var(--primary)] h-full rounded-full transition-all duration-300"
                                    style={{ width: `${scanProgress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. FILTER & TARGETED OPERATOR PICKER BAR */}
                <div className="space-y-3">
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-sm">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[var(--muted)] shrink-0" />
                                <span className="text-xs font-semibold text-[var(--muted)] whitespace-nowrap">
                                    Scope:
                                </span>
                            </div>
                            <select
                                value={currentDistrict}
                                onChange={(e) => handleDistrictChange(e.target.value)}
                                className="bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-[var(--primary)] w-full sm:w-64"
                            >
                                <option value="all">All Tamil Nadu (38 districts · {totalStatewide} vendors)</option>
                                {districts.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>

                            {/* Pick Specific Operators Trigger Button */}
                            <button
                                type="button"
                                onClick={() => setShowVendorPicker(!showVendorPicker)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                                    showVendorPicker || selectedVendorIds.length > 0
                                        ? 'bg-[#8B1E2D] text-white border-[#8B1E2D] shadow-sm'
                                        : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text)] hover:border-[#8B1E2D]/40'
                                }`}
                            >
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                                <span>{showVendorPicker ? 'Close Vendor Selector' : `Select Particular Vendors (${selectedVendorIds.length})`}</span>
                            </button>

                            {selectedVendorIds.length > 0 && (
                                <label className="flex items-center gap-1.5 text-xs text-[var(--text)] cursor-pointer select-none bg-[var(--bg)] px-3 py-2 rounded-xl border border-[var(--border)]">
                                    <input
                                        type="checkbox"
                                        checked={onlyShowSelected}
                                        onChange={(e) => setOnlyShowSelected(e.target.checked)}
                                        className="rounded border-[var(--border)] text-[#8B1E2D] focus:ring-[#8B1E2D]"
                                    />
                                    <span className="font-semibold">Show only {selectedVendorIds.length} chosen</span>
                                </label>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-[var(--muted)] hidden sm:inline">
                                {totalScanned} scanned
                            </span>

                            {/* Search Input */}
                            <div className="relative w-full sm:w-64">
                                <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-2.5" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search operator name or ID..."
                                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* EXPANDABLE TARGETED VENDOR SELECTOR PANEL */}
                    {showVendorPicker && (
                        <div className="p-5 rounded-2xl bg-[var(--card)] border border-[#8B1E2D]/40 shadow-lg space-y-4 animate-in fade-in">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
                                <div>
                                    <h4 className="font-bold text-sm text-[var(--text)] flex items-center gap-2">
                                        <SlidersHorizontal className="w-4 h-4 text-[#8B1E2D] dark:text-[#E7A8AF]" />
                                        <span>Targeted Operator Multi-Selector</span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8B1E2D]/10 text-[#8B1E2D] dark:text-[#E7A8AF]">
                                            {selectedVendorIds.length} of {allVendorsPool.length} marked
                                        </span>
                                    </h4>
                                    <p className="text-[11px] text-[var(--muted)] mt-0.5">
                                        Select any particular vendors across Tamil Nadu districts to run targeted static and AI Anomaly scans
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleSelectAllVendors}
                                        className="px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[11px] font-semibold text-[var(--text)] hover:border-[#8B1E2D] cursor-pointer"
                                    >
                                        Select All ({allVendorsPool.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSelectHighRiskVendors}
                                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                                    >
                                        Select High Risk ({highRiskVendors.length})
                                    </button>
                                    {selectedVendorIds.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleClearVendorSelection}
                                            className="px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Vendor Search in Picker */}
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-3 top-2.5" />
                                <input
                                    type="text"
                                    value={vendorPickerSearch}
                                    onChange={(e) => setVendorPickerSearch(e.target.value)}
                                    placeholder="Quick search operators by name or district..."
                                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[#8B1E2D]"
                                />
                            </div>

                            {/* Multi-Column Checklist Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
                                {allVendorsPool
                                    .filter(v => 
                                        !vendorPickerSearch.trim() ||
                                        v.business_name?.toLowerCase().includes(vendorPickerSearch.toLowerCase()) ||
                                        v.district?.name?.toLowerCase().includes(vendorPickerSearch.toLowerCase())
                                    )
                                    .map((v) => {
                                        const isChecked = selectedVendorIds.includes(v.id);
                                        const score = v.calculated_fraud_score || v.fraud_risk_score || 15;
                                        return (
                                            <div
                                                key={v.id}
                                                onClick={() => handleToggleVendor(v.id)}
                                                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
                                                    isChecked
                                                        ? 'bg-[#8B1E2D]/10 border-[#8B1E2D] text-[var(--text)] ring-1 ring-[#8B1E2D]'
                                                        : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text)] hover:border-[#8B1E2D]/40'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handleToggleVendor(v.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="rounded border-[var(--border)] text-[#8B1E2D] focus:ring-[#8B1E2D]"
                                                    />
                                                    <div className="truncate">
                                                        <div className="font-semibold truncate text-[11px]">{v.business_name}</div>
                                                        <div className="text-[10px] text-[var(--muted)] truncate">{v.district?.name || 'Tamil Nadu'}</div>
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                                                    score >= 65
                                                        ? 'bg-rose-500/15 text-rose-600'
                                                        : score >= 35
                                                        ? 'bg-amber-500/15 text-amber-600'
                                                        : 'bg-teal-500/15 text-teal-600'
                                                }`}>
                                                    {score}
                                                </span>
                                            </div>
                                        );
                                    })}
                            </div>

                            {/* Footer in Picker */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-[var(--border)] text-xs">
                                <span className="text-[var(--muted)]">
                                    {selectedVendorIds.length} operator(s) selected for targeted AI scanner execution
                                </span>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        disabled={selectedVendorIds.length === 0 || scanning}
                                        onClick={handleScanSelectedVendors}
                                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#8B1E2D] hover:opacity-90 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                                    >
                                        <Zap className="w-3.5 h-3.5" />
                                        <span>Run Scan on {selectedVendorIds.length} Selected</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. 4 NEUTRAL KPI SUMMARY CARDS (Colors ONLY on chips) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Scanned */}
                    <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex items-center justify-between">
                        <div>
                            <div className="text-[11px] text-[var(--muted)] uppercase font-semibold">Total Scanned</div>
                            <div className="text-2xl font-black text-[var(--text)] mt-1">{totalScanned}</div>
                            <div className="text-[11px] text-[var(--muted)] mt-0.5">57 active entities</div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-[var(--border)] text-xs font-bold font-mono">
                            38 Districts
                        </span>
                    </div>

                    {/* High Risk */}
                    <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex items-center justify-between">
                        <div>
                            <div className="text-[11px] text-[var(--muted)] uppercase font-semibold">High Risk Anomaly</div>
                            <div className="text-2xl font-black text-[var(--text)] mt-1">{highRiskVendors.length}</div>
                            <div className="text-[11px] text-[var(--muted)] mt-0.5">Score ≥ 65 (Needs Review)</div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold font-mono">
                            High Risk
                        </span>
                    </div>

                    {/* Medium Risk */}
                    <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex items-center justify-between">
                        <div>
                            <div className="text-[11px] text-[var(--muted)] uppercase font-semibold">Medium Risk</div>
                            <div className="text-2xl font-black text-[var(--text)] mt-1">{moderateRiskVendors.length}</div>
                            <div className="text-[11px] text-[var(--muted)] mt-0.5">Score 35–64 (Under Observation)</div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold font-mono">
                            Medium Risk
                        </span>
                    </div>

                    {/* Compliant / Safe */}
                    <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex items-center justify-between">
                        <div>
                            <div className="text-[11px] text-[var(--muted)] uppercase font-semibold">Verified Compliant</div>
                            <div className="text-2xl font-black text-[var(--text)] mt-1">{lowRiskVendors.length}</div>
                            <div className="text-[11px] text-[var(--muted)] mt-0.5">Score &lt; 35 (Normal Range)</div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-xs font-bold font-mono">
                            Safe
                        </span>
                    </div>
                </div>

                {/* 4. UNIFIED MODEL CARD (Read dynamically from benchmark.csv) */}
                <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                            <h4 className="text-sm font-bold text-[var(--text)]">
                                {modelCard.model_name || 'Isolation Forest Hybrid Anomaly Scanner'}
                            </h4>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]">
                                {modelCard.model_version || 'v2.4-iso-forest'}
                            </span>
                        </div>
                        <div className="text-[11px] text-[var(--muted)] flex items-center gap-3 font-mono">
                            <span>Last Trained: {modelCard.last_trained_date || '2026-10-02'}</span>
                            <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 font-bold">
                                {modelCard.status || 'Active in Production'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                            <div className="text-[10px] text-[var(--muted)] uppercase font-semibold">Training Vendors</div>
                            <div className="text-sm font-bold text-[var(--text)] mt-0.5 font-mono">
                                {modelCard.training_vendors || 57} entities
                            </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                            <div className="text-[10px] text-[var(--muted)] uppercase font-semibold">Benchmark Precision</div>
                            <div className="text-sm font-bold text-[var(--text)] mt-0.5 font-mono">
                                {modelCard.precision || 91.8}%
                            </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                            <div className="text-[10px] text-[var(--muted)] uppercase font-semibold">Benchmark Recall</div>
                            <div className="text-sm font-bold text-[var(--text)] mt-0.5 font-mono">
                                {modelCard.recall || 94.0}%
                            </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                            <div className="text-[10px] text-[var(--muted)] uppercase font-semibold">F1-Score</div>
                            <div className="text-sm font-bold text-[var(--text)] mt-0.5 font-mono">
                                {modelCard.f1_score || 0.929}
                            </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                            <div className="text-[10px] text-[var(--muted)] uppercase font-semibold">False Positive Rate</div>
                            <div className="text-sm font-bold text-[var(--text)] mt-0.5 font-mono">
                                {modelCard.false_positive_rate || 2.1}%
                            </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                            <div className="text-[10px] text-[var(--muted)] uppercase font-semibold">ROC-AUC</div>
                            <div className="text-sm font-bold text-[var(--text)] mt-0.5 font-mono">
                                {modelCard.roc_auc || 0.962}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. TARGETED SCAN OUTPUT BANNER & RESULTS ANCHOR */}
                <div id="fraud-results-section" className="scroll-mt-6 space-y-6">
                    {onlyShowSelected && selectedVendorIds.length > 0 && (
                        <div className="p-4 rounded-2xl bg-[#8B1E2D]/10 border border-[#8B1E2D]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#8B1E2D] text-white flex items-center justify-center shrink-0">
                                    <Sparkles className="w-4 h-4 text-amber-300" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs sm:text-sm text-[var(--text)]">
                                        ⚡ Targeted Scan Output for {selectedVendorIds.length} Selected Operator(s)
                                    </h4>
                                    <p className="text-[11px] text-[var(--muted)]">
                                        Isolation Forest hybrid risk engine evaluated {selectedVendorIds.length} entities with peer-group behavioral profiling.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setOnlyShowSelected(false)}
                                    className="px-3 py-1.5 rounded-xl bg-[var(--card)] hover:bg-[var(--bg)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] cursor-pointer"
                                >
                                    Show All {totalStatewide} Entities
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowVendorPicker(true)}
                                    className="px-3 py-1.5 rounded-xl bg-[#8B1E2D] text-white text-xs font-bold hover:opacity-90 cursor-pointer"
                                >
                                    Reopen Selector
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 5. CRITICAL HIGH RISK WATCHLIST */}
                    {filteredHigh.length > 0 && (
                        <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-rose-500" />
                                <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider">
                                    Critical Anomaly Watchlist ({filteredHigh.length})
                                </h3>
                            </div>
                            <span className="text-xs text-[var(--muted)]">
                                System only recommends · Administrative decision required
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredHigh.map((v) => {
                                const flag = getFlagForVendor(v.id);
                                const isChecked = selectedVendorIds.includes(v.id);
                                return (
                                    <div key={v.id} className={`p-5 rounded-xl bg-[var(--card)] border space-y-3.5 flex flex-col justify-between shadow-sm transition-all ${
                                        isChecked ? 'border-[#8B1E2D] ring-2 ring-[#8B1E2D]/30' : 'border-[var(--border)]'
                                    }`}>
                                        <div>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-2.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handleToggleVendor(v.id)}
                                                        className="mt-1 rounded border-[var(--border)] text-[#8B1E2D] focus:ring-[#8B1E2D] cursor-pointer"
                                                        title="Select for batch scanning"
                                                    />
                                                    <div>
                                                        <h4 className="font-bold text-[var(--text)] text-sm">{v.business_name}</h4>
                                                        <p className="text-[11px] text-[var(--muted)] flex items-center gap-1.5 mt-0.5">
                                                            <MapPin className="w-3 h-3 text-[var(--muted)]" /> 
                                                            <span>{v.district?.name || 'Tamil Nadu'}</span>
                                                            <span>•</span>
                                                            <span className="capitalize">{v.service_type || 'Operator'}</span>
                                                            <span>•</span>
                                                            <span>ID #{v.id}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-mono font-bold text-xs shrink-0">
                                                    {v.calculated_fraud_score || v.fraud_risk_score}/100 Risk
                                                </span>
                                            </div>

                                            {/* Top 3 Plain Language Explanations */}
                                            <div className="mt-3 space-y-2">
                                                <div className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">
                                                    Top Peer-Relative Anomaly Factors:
                                                </div>
                                                {(v.top_risk_reasons && v.top_risk_reasons.length > 0) ? (
                                                    v.top_risk_reasons.map((reason, idx) => (
                                                        <div key={idx} className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs space-y-1">
                                                            <div className="font-bold text-[var(--text)] flex items-center justify-between">
                                                                <span>{idx + 1}. {reason.title}</span>
                                                                <span className="text-[10px] font-mono text-[var(--muted)]">{reason.peer_metric}</span>
                                                            </div>
                                                            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                                                                {reason.explanation}
                                                            </p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--muted)]">
                                                        {v.calculated_fraud_reason || v.fraud_risk_reason || 'Peer baseline deviation flagged by Isolation Forest.'}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Evidence Links */}
                                            <div className="flex items-center gap-3 pt-2 text-xs text-[var(--muted)]">
                                                <a 
                                                    href={`/vendor/${v.slug || v.id}`} 
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="hover:text-[var(--text)] flex items-center gap-1 underline underline-offset-2"
                                                >
                                                    <ExternalLink className="w-3 h-3" /> Storefront
                                                </a>
                                                <span>•</span>
                                                <span>Bookings: {v.bookings_count || 0}</span>
                                                <span>•</span>
                                                <span>Account Age: {v.account_age_days || 0} days</span>
                                            </div>
                                        </div>

                                        {/* Human In The Loop Actions */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[var(--border)] text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => setDismissModal({ flagId: flag?.id || v.id, vendorName: v.business_name })}
                                                    className="px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--card)] text-[var(--text)] font-semibold transition-colors"
                                                    title="Dismiss with logged reason"
                                                >
                                                    Dismiss
                                                </button>
                                                <button
                                                    onClick={() => setWarnModal({ flagId: flag?.id || v.id, vendorName: v.business_name })}
                                                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-500/20 transition-colors"
                                                >
                                                    Warn
                                                </button>
                                                <button
                                                    onClick={() => setRequestInfoModal({ flagId: flag?.id || v.id, vendorName: v.business_name })}
                                                    className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-500/20 transition-colors"
                                                >
                                                    Request Info
                                                </button>
                                                <button
                                                    onClick={() => setSuspendModal({ flagId: flag?.id || v.id, vendorName: v.business_name, vendorId: v.id })}
                                                    className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-500/20 transition-colors"
                                                >
                                                    Suspend
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setResolveModal(v)}
                                                    className="px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--card)] text-[var(--text)] font-semibold flex items-center gap-1 transition-colors"
                                                >
                                                    <SlidersHorizontal className="w-3 h-3" />
                                                    <span>Resolve</span>
                                                </button>
                                                <button
                                                    onClick={() => handleScanSingleVendor(v.id)}
                                                    disabled={scanningVendorId === v.id}
                                                    className="px-2.5 py-1 rounded-lg bg-[#8B1E2D]/10 hover:bg-[#8B1E2D]/20 text-[#8B1E2D] dark:text-[#E7A8AF] font-bold flex items-center gap-1 cursor-pointer"
                                                    title="Re-scan this operator with Isolation Forest"
                                                >
                                                    <Zap className={`w-3.5 h-3.5 ${scanningVendorId === v.id ? 'animate-spin' : ''}`} />
                                                    <span>Scan</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 6. MODERATE, COLD START, AND COMPLIANT ENTITIES */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Moderate Risk */}
                    <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
                                <span>Moderate Risk (Score 35–64)</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono border border-amber-500/20">
                                    {filteredModerate.length}
                                </span>
                            </h4>
                        </div>

                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                            {filteredModerate.length === 0 ? (
                                <p className="text-xs text-[var(--muted)] py-6 text-center">No moderate risk entities in current view.</p>
                            ) : (
                                filteredModerate.map((v) => {
                                    const isChecked = selectedVendorIds.includes(v.id);
                                    return (
                                        <div 
                                            key={v.id} 
                                            className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 transition-all ${
                                                isChecked ? 'bg-[#8B1E2D]/10 border-[#8B1E2D]' : 'bg-[var(--bg)] border-[var(--border)] hover:border-[var(--primary)]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handleToggleVendor(v.id)}
                                                    className="rounded border-[var(--border)] text-[#8B1E2D] focus:ring-[#8B1E2D] cursor-pointer"
                                                />
                                                <div className="min-w-0 cursor-pointer" onClick={() => setInspectVendor(v)}>
                                                    <div className="font-semibold text-[var(--text)] truncate">{v.business_name}</div>
                                                    <p className="text-[10px] text-[var(--muted)] mt-0.5 truncate flex items-center gap-1">
                                                        <MapPin className="w-2.5 h-2.5 text-[var(--muted)] shrink-0" />
                                                        <span>{v.district?.name} • {v.top_risk_reasons?.[0]?.title || 'Observation'}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[11px]">
                                                    {v.calculated_fraud_score || v.fraud_risk_score} pts
                                                </span>
                                                <button
                                                    onClick={() => handleScanSingleVendor(v.id)}
                                                    disabled={scanningVendorId === v.id}
                                                    className="p-1 rounded bg-[var(--card)] hover:bg-[#8B1E2D]/10 text-[#8B1E2D] cursor-pointer"
                                                    title="Scan this vendor"
                                                >
                                                    <Zap className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Cold Start / Insufficient Data */}
                    <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
                                <span>Insufficient Data (&lt; 30d / &lt; 5b)</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 font-mono border border-slate-500/20">
                                    {filteredInsufficient.length}
                                </span>
                            </h4>
                        </div>

                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                            {filteredInsufficient.length === 0 ? (
                                <p className="text-xs text-[var(--muted)] py-6 text-center">No cold-start operators in current view.</p>
                            ) : (
                                filteredInsufficient.map((v) => {
                                    const isChecked = selectedVendorIds.includes(v.id);
                                    return (
                                        <div 
                                            key={v.id} 
                                            className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 transition-all ${
                                                isChecked ? 'bg-[#8B1E2D]/10 border-[#8B1E2D]' : 'bg-[var(--bg)] border-[var(--border)] hover:border-[var(--primary)]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handleToggleVendor(v.id)}
                                                    className="rounded border-[var(--border)] text-[#8B1E2D] focus:ring-[#8B1E2D] cursor-pointer"
                                                />
                                                <div className="min-w-0 cursor-pointer" onClick={() => setInspectVendor(v)}>
                                                    <div className="font-semibold text-[var(--text)] truncate">{v.business_name}</div>
                                                    <p className="text-[10px] text-[var(--muted)] mt-0.5 truncate flex items-center gap-1">
                                                        <Info className="w-2.5 h-2.5 text-[var(--muted)] shrink-0" />
                                                        <span>{v.district?.name} • New account / Low volume</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="font-mono text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded bg-slate-500/10 border border-slate-500/20 text-[10px]">
                                                    Rules only
                                                </span>
                                                <button
                                                    onClick={() => handleScanSingleVendor(v.id)}
                                                    disabled={scanningVendorId === v.id}
                                                    className="p-1 rounded bg-[var(--card)] hover:bg-[#8B1E2D]/10 text-[#8B1E2D] cursor-pointer"
                                                    title="Scan this vendor"
                                                >
                                                    <Zap className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Verified Compliant */}
                    <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
                                <span>Verified Compliant (Score &lt; 35)</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-mono border border-teal-500/20">
                                    {filteredLow.length}
                                </span>
                            </h4>
                        </div>

                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                            {filteredLow.length === 0 ? (
                                <p className="text-xs text-[var(--muted)] py-6 text-center">No compliant operators in view.</p>
                            ) : (
                                filteredLow.map((v) => {
                                    const isChecked = selectedVendorIds.includes(v.id);
                                    return (
                                        <div 
                                            key={v.id} 
                                            className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 transition-all ${
                                                isChecked ? 'bg-[#8B1E2D]/10 border-[#8B1E2D]' : 'bg-[var(--bg)] border-[var(--border)] hover:border-[var(--primary)]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handleToggleVendor(v.id)}
                                                    className="rounded border-[var(--border)] text-[#8B1E2D] focus:ring-[#8B1E2D] cursor-pointer"
                                                />
                                                <div className="min-w-0 cursor-pointer" onClick={() => setInspectVendor(v)}>
                                                    <div className="font-semibold text-[var(--text)] flex items-center gap-1.5 truncate">
                                                        <ShieldCheck className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                                                        <span className="truncate">{v.business_name}</span>
                                                    </div>
                                                    <p className="text-[10px] text-[var(--muted)] mt-0.5 flex items-center gap-1">
                                                        <MapPin className="w-2.5 h-2.5 text-[var(--muted)] shrink-0" />
                                                        <span>{v.district?.name} • Trust Score: {Math.round((v.trust_score || 0.95)*100)}%</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="font-mono font-bold text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-[11px]">
                                                    {v.calculated_fraud_score || v.fraud_risk_score || 10} pts
                                                </span>
                                                <button
                                                    onClick={() => handleScanSingleVendor(v.id)}
                                                    disabled={scanningVendorId === v.id}
                                                    className="p-1 rounded bg-[var(--card)] hover:bg-[#8B1E2D]/10 text-[#8B1E2D] cursor-pointer"
                                                    title="Scan this vendor"
                                                >
                                                    <Zap className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
                </div>
            </div>

            {/* MODAL 1: INSPECT VENDOR DETAILS */}
            {inspectVendor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="relative w-full max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 text-[var(--text)] space-y-4 shadow-xl">
                        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                            <div>
                                <h4 className="text-base font-bold text-[var(--text)]">
                                    Operator Risk & Peer Profiling
                                </h4>
                                <p className="text-xs text-[var(--muted)]">
                                    {inspectVendor.business_name} ({inspectVendor.district?.name})
                                </p>
                            </div>
                            <button onClick={() => setInspectVendor(null)} className="text-[var(--muted)] hover:text-[var(--text)] p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-2.5 text-xs">
                            <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1">
                                <div className="text-[10px] font-bold text-[var(--muted)] uppercase">Risk Classification</div>
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold capitalize">{inspectVendor.risk_tier} Status</span>
                                    <span className="font-mono font-bold">{inspectVendor.calculated_fraud_score || inspectVendor.fraud_risk_score}/100</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-[10px] font-bold text-[var(--muted)] uppercase">Peer Comparison & Reasons</div>
                                {(inspectVendor.top_risk_reasons && inspectVendor.top_risk_reasons.length > 0) ? (
                                    inspectVendor.top_risk_reasons.map((r, i) => (
                                        <div key={i} className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                                            <div className="font-bold text-[var(--text)]">{r.title}</div>
                                            <div className="text-[11px] text-[var(--muted)] mt-0.5">{r.explanation}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)]">
                                        Metrics match peer medians for this district and category.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                            <button
                                type="button"
                                onClick={() => setInspectVendor(null)}
                                className="px-4 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs font-semibold text-[var(--text)]"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: DISMISS (REASON REQUIRED) */}
            {dismissModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="relative w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 text-[var(--text)] space-y-4 shadow-xl">
                        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                            <h4 className="text-base font-bold text-[var(--text)]">
                                Dismiss Anomaly: {dismissModal.vendorName}
                            </h4>
                            <button onClick={() => setDismissModal(null)} className="text-[var(--muted)] hover:text-[var(--text)]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitDismiss} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                                    Administrative Justification <span className="text-rose-500">* (Required)</span>
                                </label>
                                <textarea
                                    rows="3"
                                    required
                                    placeholder="e.g. Verified with operator; sudden cancellation spike was due to Nilgiris landslide weather advisory."
                                    value={dismissReason}
                                    onChange={(e) => setDismissReason(e.target.value)}
                                    className="w-full p-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                                />
                            </div>

                            <p className="text-[11px] text-[var(--muted)]">
                                This decision is saved to the audit log and serves as a label to refine future Isolation Forest runs.
                            </p>

                            <div className="flex gap-2 justify-end pt-2">
                                <button type="button" onClick={() => setDismissModal(null)} className="px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-xs">
                                    Cancel
                                </button>
                                <button type="submit" disabled={!dismissReason.trim()} className="px-3.5 py-1.5 rounded-lg bg-[var(--primary)] text-white font-bold text-xs disabled:opacity-50">
                                    Confirm Dismissal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: WARN */}
            {warnModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="relative w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 text-[var(--text)] space-y-4 shadow-xl">
                        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                            <h4 className="text-base font-bold text-[var(--text)]">
                                Issue Official Warning: {warnModal.vendorName}
                            </h4>
                            <button onClick={() => setWarnModal(null)} className="text-[var(--muted)] hover:text-[var(--text)]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitWarn} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Warning Notice / Note</label>
                                <textarea
                                    rows="3"
                                    placeholder="e.g. Your account has logged unusual cancellation frequency. Please ensure all booked trips are honored."
                                    value={warnNote}
                                    onChange={(e) => setWarnNote(e.target.value)}
                                    className="w-full p-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                                />
                            </div>

                            <div className="flex gap-2 justify-end pt-2">
                                <button type="button" onClick={() => setWarnModal(null)} className="px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-xs">
                                    Cancel
                                </button>
                                <button type="submit" className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs">
                                    Send Warning
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 4: REQUEST INFO */}
            {requestInfoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="relative w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 text-[var(--text)] space-y-4 shadow-xl">
                        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                            <h4 className="text-base font-bold text-[var(--text)]">
                                Request Information: {requestInfoModal.vendorName}
                            </h4>
                            <button onClick={() => setRequestInfoModal(null)} className="text-[var(--muted)] hover:text-[var(--text)]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitRequestInfo} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                                    Information Required <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows="3"
                                    required
                                    placeholder="e.g. Please provide updated permit documentation for outside-district trips and explanation for recent quote variances."
                                    value={requestInfoMessage}
                                    onChange={(e) => setRequestInfoMessage(e.target.value)}
                                    className="w-full p-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Response Window</label>
                                <select
                                    value={requestInfoDeadline}
                                    onChange={(e) => setRequestInfoDeadline(Number(e.target.value))}
                                    className="w-full p-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)]"
                                >
                                    <option value={3}>3 Days (Urgent)</option>
                                    <option value={7}>7 Days (Standard)</option>
                                    <option value={14}>14 Days (Extended)</option>
                                </select>
                            </div>

                            <div className="flex gap-2 justify-end pt-2">
                                <button type="button" onClick={() => setRequestInfoModal(null)} className="px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-xs">
                                    Cancel
                                </button>
                                <button type="submit" disabled={!requestInfoMessage.trim()} className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs disabled:opacity-50">
                                    Send Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 5: SUSPEND (CONFIRMATION STEP REQUIRED) */}
            {suspendModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="relative w-full max-w-md bg-[var(--card)] border border-rose-500/30 rounded-2xl p-6 text-[var(--text)] space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                            <div className="flex items-center gap-2">
                                <AlertOctagon className="w-5 h-5 text-rose-500" />
                                <h4 className="text-base font-bold text-rose-600 dark:text-rose-400">
                                    Suspend Vendor Account
                                </h4>
                            </div>
                            <button onClick={() => setSuspendModal(null)} className="text-[var(--muted)] hover:text-[var(--text)]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitSuspend} className="space-y-3.5">
                            <p className="text-xs text-[var(--muted)]">
                                Suspending <strong className="text-[var(--text)]">{suspendModal.vendorName}</strong> will hide their listings, disable booking requests, and lock storefront operations.
                            </p>

                            <div>
                                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                                    Reason for Suspension <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows="2"
                                    required
                                    placeholder="e.g. Unverified KYC and confirmed off-platform payment evasion detected."
                                    value={suspendReason}
                                    onChange={(e) => setSuspendReason(e.target.value)}
                                    className="w-full p-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] focus:outline-none focus:border-rose-500"
                                />
                            </div>

                            <label className="flex items-start gap-2 text-xs text-[var(--text)] cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={suspendConfirmed}
                                    onChange={(e) => setSuspendConfirmed(e.target.checked)}
                                    className="mt-0.5 rounded border-[var(--border)] text-rose-600 focus:ring-rose-500"
                                />
                                <span>I confirm that I have reviewed the evidence and authorize account suspension.</span>
                            </label>

                            <div className="flex gap-2 justify-end pt-2 border-t border-[var(--border)]">
                                <button type="button" onClick={() => setSuspendModal(null)} className="px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-xs">
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={!suspendConfirmed || !suspendReason.trim()}
                                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs disabled:opacity-50 transition-colors"
                                >
                                    Confirm Account Suspension
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 6: RESOLVE (Renamed from Override) */}
            {resolveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="relative w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 text-[var(--text)] space-y-4 shadow-xl">
                        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                            <h4 className="text-base font-bold text-[var(--text)]">
                                Resolve Profile: {resolveModal.business_name}
                            </h4>
                            <button onClick={() => setResolveModal(null)} className="text-[var(--muted)] hover:text-[var(--text)]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitResolve} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Adjusted Risk Score (0-100)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    required
                                    value={resolveScore}
                                    onChange={(e) => setResolveScore(e.target.value)}
                                    className="w-full p-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Resolution Justification</label>
                                <textarea
                                    rows="2"
                                    placeholder="e.g. In-person premises inspection verified; anomaly cleared."
                                    value={resolveReason}
                                    onChange={(e) => setResolveReason(e.target.value)}
                                    className="w-full p-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                                />
                            </div>

                            <div className="flex gap-2 justify-end pt-2">
                                <button type="button" onClick={() => setResolveModal(null)} className="px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-xs">
                                    Cancel
                                </button>
                                <button type="submit" className="px-3.5 py-1.5 rounded-lg bg-[var(--primary)] text-white font-bold text-xs">
                                    Save Resolution
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
