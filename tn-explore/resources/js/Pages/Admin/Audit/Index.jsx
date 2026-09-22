import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Activity,
    Search,
    Filter,
    Shield,
    Calendar,
    Clock,
    User,
    FileText
} from 'lucide-react';

export default function AuditIndex({ logs, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [actionFilter, setActionFilter] = useState(filters.action || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.audit.index'), {
            search,
            action: actionFilter,
        }, { preserveState: true });
    };

    return (
        <AdminLayout
            title="System Audit Trail & Security Logs"
            subtitle="Immutable chronological ledger of all administrative decisions, status overrides & KYC approvals"
        >
            <Head title="Audit Logs — Admin" />

            <div className="space-y-6">

                {/* SEARCH & FILTERS */}
                <form onSubmit={handleSearch} className="p-4 rounded-2xl bg-[#0E1526] border border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by admin name, action, target, or reason..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="bg-slate-950 border border-white/10 rounded-xl text-xs text-gray-300 px-3 py-1.5 focus:outline-none"
                        >
                            <option value="">All Action Types</option>
                            <option value="kyc">KYC Actions</option>
                            <option value="status">Status Changes</option>
                            <option value="user">User Governance</option>
                            <option value="data">Dataset Modifications</option>
                            <option value="fraud">Fraud Overrides</option>
                        </select>

                        <button
                            type="submit"
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-all"
                        >
                            Filter
                        </button>
                    </div>
                </form>

                {/* AUDIT LOG TABLE */}
                <div className="p-6 rounded-2xl bg-[#0E1526] border border-white/10 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-gray-300">
                            <thead className="bg-white/5 text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Timestamp</th>
                                    <th className="px-4 py-3">Administrator</th>
                                    <th className="px-4 py-3">Action</th>
                                    <th className="px-4 py-3">Target Entity</th>
                                    <th className="px-4 py-3">Audit Details / Justification</th>
                                    <th className="px-4 py-3 rounded-r-lg text-right">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {logs.data?.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/5 transition font-mono">
                                        <td className="px-4 py-3 text-[11px] text-gray-400 whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-sans font-bold text-amber-300">{log.admin_name}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded-md bg-white/5 text-emerald-400 text-[10px] font-bold">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">
                                            {log.target_type} {log.target_id ? `(#${log.target_id})` : ''}
                                        </td>
                                        <td className="px-4 py-3 text-gray-300 font-sans max-w-sm">
                                            {log.reason || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-500 text-[10px]">
                                            {log.ip_address || '127.0.0.1'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
