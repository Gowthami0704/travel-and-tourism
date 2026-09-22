import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    AlertTriangle,
    ShieldAlert,
    ShieldCheck,
    RefreshCw,
    CheckCircle2,
    SlidersHorizontal,
    X,
    Activity,
    Store,
    MapPin,
    Sparkles
} from 'lucide-react';

export default function FraudIndex({ highRiskVendors = [], moderateRiskVendors = [], lowRiskVendors = [], openFraudFlags = [], totalScanned = 0 }) {
    const [scanning, setScanning] = useState(false);
    const [selectedOverrideVendor, setSelectedOverrideVendor] = useState(null);
    const [overrideScore, setOverrideScore] = useState(20);
    const [overrideReason, setOverrideReason] = useState('');

    const handleRunScan = () => {
        setScanning(true);
        router.post(route('admin.fraud.scan'), {}, {
            preserveScroll: true,
            onFinish: () => setScanning(false)
        });
    };

    const handleResolveFlag = (flagId) => {
        router.post(route('admin.fraud.resolve', flagId), {}, {
            preserveScroll: true,
        });
    };

    const handleOverrideSubmit = (e) => {
        e.preventDefault();
        if (!selectedOverrideVendor) return;
        router.post(route('admin.fraud.overrideScore', selectedOverrideVendor.id), {
            score: Number(overrideScore),
            reason: overrideReason,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedOverrideVendor(null);
                setOverrideReason('');
            }
        });
    };

    return (
        <AdminLayout
            title="AI Fraud Detection & Anomaly Scanner"
            subtitle={`Automated 5-factor risk scoring across ${totalScanned} partner entities in Tamil Nadu`}
        >
            <Head title="AI Fraud Scanner — Admin" />

            <div className="space-y-6">

                {/* SCANNER HERO BANNER */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950/40 via-[#0E1526] to-[#0E1526] border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center flex-shrink-0">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-white">Isolation Forest & Rule-Based Fraud Engine</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold uppercase">
                                    Live
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5 max-w-xl">
                                Evaluates cancellation volume, customer complaints, negative review sentiment, document KYC validity, and account age.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleRunScan}
                        disabled={scanning}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                    >
                        <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
                        <span>{scanning ? 'Auditing Database...' : 'Run Statewide AI Scan'}</span>
                    </button>
                </div>

                {/* HIGH RISK ALERT SECTION */}
                {highRiskVendors.length > 0 && (
                    <div className="p-6 rounded-3xl bg-[#0E1526] border border-red-500/30 space-y-4 shadow-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                    Critical High Risk Entities ({highRiskVendors.length})
                                </h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {highRiskVendors.map((v) => (
                                <div key={v.id} className="p-4 rounded-2xl bg-red-950/20 border border-red-500/40 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-bold text-white text-sm">{v.business_name}</h4>
                                            <p className="text-[11px] text-gray-400">{v.district?.name} • ID #{v.id}</p>
                                        </div>
                                        <span className="px-2 py-0.5 rounded bg-red-500 text-slate-950 font-black text-xs font-mono">
                                            {v.calculated_fraud_score || v.fraud_risk_score}/100
                                        </span>
                                    </div>

                                    <p className="text-xs text-red-300 leading-relaxed bg-red-950/40 p-2.5 rounded-xl border border-red-500/20">
                                        {v.calculated_fraud_reason || v.fraud_risk_reason}
                                    </p>

                                    <div className="flex items-center justify-between pt-1">
                                        <button
                                            onClick={() => { setSelectedOverrideVendor(v); setOverrideScore(20); }}
                                            className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                                        >
                                            <SlidersHorizontal className="w-3.5 h-3.5" />
                                            <span>Manual Override</span>
                                        </button>

                                        <Link
                                            href={route('admin.vendors.index', { search: v.business_name })}
                                            className="text-xs text-gray-400 hover:text-white"
                                        >
                                            Inspect Profile →
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* MODERATE & LOW RISK CATALOG */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Moderate Risk */}
                    <div className="p-5 rounded-3xl bg-[#0E1526] border border-amber-500/20 space-y-3">
                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                            <span>Moderate Watchlist (Score 30-49)</span>
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300">
                                {moderateRiskVendors.length}
                            </span>
                        </h4>

                        <div className="space-y-2 max-h-72 overflow-y-auto">
                            {moderateRiskVendors.map((v) => (
                                <div key={v.id} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold text-white">{v.business_name}</div>
                                        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{v.calculated_fraud_reason}</p>
                                    </div>
                                    <span className="font-mono font-bold text-amber-400 ml-2">
                                        {v.calculated_fraud_score || v.fraud_risk_score} pts
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Low Risk / Clean */}
                    <div className="p-5 rounded-3xl bg-[#0E1526] border border-emerald-500/20 space-y-3">
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                            <span>Verified Compliant Operators (Score &lt; 30)</span>
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300">
                                {lowRiskVendors.length}
                            </span>
                        </h4>

                        <div className="space-y-2 max-h-72 overflow-y-auto">
                            {lowRiskVendors.map((v) => (
                                <div key={v.id} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold text-white flex items-center gap-1.5">
                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>{v.business_name}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{v.district?.name} • Trust: {Math.round((v.trust_score || 0.95)*100)}%</p>
                                    </div>
                                    <span className="font-mono font-bold text-emerald-400 ml-2">
                                        {v.calculated_fraud_score || v.fraud_risk_score || 10} pts
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* MANUAL OVERRIDE MODAL */}
            {selectedOverrideVendor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                    <div className="relative w-full max-w-md bg-[#0E1526] border border-white/10 rounded-2xl p-6 text-white space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h4 className="text-base font-bold text-white">
                                Override Fraud Score: {selectedOverrideVendor.business_name}
                            </h4>
                            <button onClick={() => setSelectedOverrideVendor(null)} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleOverrideSubmit} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">New Fraud Score (0-100)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    required
                                    value={overrideScore}
                                    onChange={(e) => setOverrideScore(e.target.value)}
                                    className="w-full p-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Reason / Officer Justification</label>
                                <textarea
                                    rows="2"
                                    required
                                    placeholder="e.g. Physical premises inspected and verified in Madurai; false complaint dismissed"
                                    value={overrideReason}
                                    onChange={(e) => setOverrideReason(e.target.value)}
                                    className="w-full p-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                                />
                            </div>

                            <div className="flex gap-2 justify-end pt-2">
                                <button type="button" onClick={() => setSelectedOverrideVendor(null)} className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 text-xs">
                                    Cancel
                                </button>
                                <button type="submit" className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs">
                                    Save Override
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
