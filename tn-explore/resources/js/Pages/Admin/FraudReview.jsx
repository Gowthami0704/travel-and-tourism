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
            <div className="p-6 rounded-2xl bg-[var(--card)] border border-purple-500/30 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300 font-mono">
                            AI Isolation Forest Microservice (Port 8001) Active
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text)]">
                        Scikit-Learn Isolation Forest Engine
                    </h3>
                    <p className="text-xs text-[var(--muted)] max-w-xl">
                        Evaluates multidimensional vendor metrics: Account age, review frequency, price deviation vs district average, and complaints to detect fraud.
                    </p>
                </div>

                <button
                    type="button"
                    disabled={processing}
                    onClick={handleRunScan}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
                >
                    <RefreshCw className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
                    <span>Run Full Platform AI Scan</span>
                </button>
            </div>

            {/* Active Fraud Flags Table */}
            <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-4 mb-8">
                <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                    Flagged Anomalies ({fraudFlags.length})
                </h3>

                {fraudFlags.length > 0 ? (
                    <div className="divide-y divide-[var(--border)]">
                        {fraudFlags.map((flag) => (
                            <div key={flag.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-[var(--text)] text-sm">
                                            {flag.vendor?.business_name}
                                        </h4>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                            flag.severity === 'high' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30' : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                        }`}>
                                            {flag.severity} Severity
                                        </span>
                                        {flag.resolved && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                                Resolved
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-[var(--text)]">
                                        Reason: <span className="text-rose-600 dark:text-rose-400 font-medium">{flag.reason}</span>
                                    </p>
                                    <p className="text-[11px] text-[var(--muted)]">
                                        District: {flag.vendor?.district?.name} • Contact: {flag.vendor?.user?.email}
                                    </p>
                                </div>

                                {!flag.resolved && (
                                    <button
                                        type="button"
                                        onClick={() => handleResolve(flag.id)}
                                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-sm self-start sm:self-center"
                                    >
                                        Mark as Resolved
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-xs text-[var(--muted)]">
                        No active anomalies flagged by the AI engine. All metrics normal.
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
