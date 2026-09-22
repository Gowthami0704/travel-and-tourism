import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { AlertTriangle, ShieldCheck, CheckCircle, RefreshCw, Award, Store, DollarSign } from 'lucide-react';

export default function FraudReview({ fraudFlags = [], suspiciousVendors = [] }) {
    const { post, processing } = useForm();

    const handleResolve = (id) => {
        post(route('admin.fraud.resolve', id));
    };

    const handleRunScan = () => {
        post(route('admin.fraud.scan'));
    };

    return (
        <AdminLayout
            title="Isolation Forest Fraud Review & Anomaly Audits"
            subtitle="AI microservice anomaly detection flagging price discrepancies and suspicious behavior"
        >
            <Head title="Fraud Review — TN Explore Admin" />

            {/* Microservice Status Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-card via-[#1A1828] to-navy-card border border-purple-500/30 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-300 font-mono">
                            AI Isolation Forest Microservice (Port 8001) Active
                        </span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-white">
                        Scikit-Learn Isolation Forest Engine
                    </h3>
                    <p className="text-xs text-gray-400 max-w-xl">
                        Evaluates multidimensional vendor metrics: Account age, review frequency, price deviation vs district average, and complaints to detect fraud.
                    </p>
                </div>

                <button
                    type="button"
                    disabled={processing}
                    onClick={handleRunScan}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
                >
                    <RefreshCw className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
                    <span>Run Full Platform AI Scan</span>
                </button>
            </div>

            {/* Active Fraud Flags Table */}
            <div className="p-6 rounded-2xl bg-navy-card border border-white/10 shadow-xl space-y-4 mb-8">
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    Flagged Anomalies ({fraudFlags.length})
                </h3>

                {fraudFlags.length > 0 ? (
                    <div className="divide-y divide-white/5">
                        {fraudFlags.map((flag) => (
                            <div key={flag.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-white text-sm">
                                            {flag.vendor?.business_name}
                                        </h4>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                            flag.severity === 'high' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                                        }`}>
                                            {flag.severity} Severity
                                        </span>
                                        {flag.resolved && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                                                Resolved
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-300">
                                        Reason: <span className="text-red-300 font-medium">{flag.reason}</span>
                                    </p>
                                    <p className="text-[11px] text-gray-500">
                                        District: {flag.vendor?.district?.name} • Contact: {flag.vendor?.user?.email}
                                    </p>
                                </div>

                                {!flag.resolved && (
                                    <button
                                        type="button"
                                        onClick={() => handleResolve(flag.id)}
                                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all cursor-pointer self-start sm:self-center"
                                    >
                                        Mark as Resolved
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-xs text-gray-400">
                        🎉 Zero unresolved fraud flags! All vendors operating within safe statistical bounds.
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
