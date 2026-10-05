import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import {
    Car,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    FileText,
    Calendar,
    Users,
    Check,
    X
} from 'lucide-react';

export default function AdminFleetReview({ vehicles = { data: [] }, status }) {
    const handleVerify = (id, newStatus) => {
        router.post(route('admin.studio.fleet.verify', { id }), {
            status: newStatus,
        });
    };

    return (
        <AdminLayout>
            <Head title="Fleet & Vehicle Documents Verification — Admin Center" />

            <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
                <div className="pb-4 border-b border-stone-200 dark:border-slate-800">
                    <h1 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
                        <Car className="w-5 h-5 text-amber-500" />
                        <span>Fleet Vehicle & Document Verification</span>
                    </h1>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        Verify vehicle road permits, RC registration validity, and commercial insurance coverage.
                    </p>
                </div>

                {status && (
                    <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>{status}</span>
                    </div>
                )}

                <div className="space-y-4">
                    {vehicles.data?.map((v) => (
                        <div
                            key={v.id}
                            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-12 rounded-2xl bg-stone-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                                    {v.media?.[0]?.thumb_path ? (
                                        <img src={v.media[0].thumb_path} alt={v.make_model} className="w-full h-full object-cover" />
                                    ) : (
                                        <Car className="w-6 h-6 text-stone-400" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-black text-stone-900 dark:text-white">
                                            {v.make_model} ({v.year})
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-500 uppercase">
                                            {v.type}
                                        </span>
                                    </div>
                                    <p className="text-xs text-stone-500">
                                        Partner: <strong>{v.vendor?.business_name}</strong> • Hub: {v.district?.name || 'Tamil Nadu'}
                                    </p>
                                    <div className="flex items-center gap-3 text-[11px] text-stone-400 font-mono">
                                        <span>Reg: {v.documents?.registration_number || 'TN-XX-XXXX'}</span>
                                        <span>•</span>
                                        <span>Insurance Expiry: {v.documents?.insurance_expiry_date || 'Active'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                                    v.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                }`}>
                                    {v.status}
                                </span>
                                {v.status !== 'approved' && (
                                    <button
                                        type="button"
                                        onClick={() => handleVerify(v.id, 'approved')}
                                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Approve Fleet</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
