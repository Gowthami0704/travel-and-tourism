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
                <form onSubmit={handleSearch} className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-wrap items-center justify-between gap-3">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--muted)]" />
                        <input
                            type="text"
                            placeholder="Search by admin name, action, target, or reason..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] px-3 py-1.5 focus:outline-none focus:border-[var(--primary)]"
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
                            className="px-3.5 py-1.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-bold text-xs cursor-pointer transition-all shadow-sm"
                        >
                            Filter
                        </button>
                    </div>
                </form>

                {/* AUDIT LOG TABLE */}
                <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-[var(--text)]">
                            <thead className="bg-[var(--bg)] text-[var(--muted)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border)]">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Timestamp</th>
                                    <th className="px-4 py-3">Administrator</th>
                                    <th className="px-4 py-3">Action</th>
                                    <th className="px-4 py-3">Target Entity</th>
                                    <th className="px-4 py-3">Audit Details / Justification</th>
                                    <th className="px-4 py-3 rounded-r-lg text-right">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {logs.data?.map((log) => (
                                    <tr key={log.id} className="hover:bg-[var(--bg)] transition font-mono">
                                        <td className="px-4 py-3 text-[11px] text-[var(--muted)] whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-sans font-bold text-[var(--primary)]">{log.admin_name}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded-md bg-[var(--bg)] border border-[var(--border)] text-teal-600 dark:text-teal-400 text-[10px] font-bold">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-[var(--text)]">
                                            {log.target_type} {log.target_id ? `(#${log.target_id})` : ''}
                                        </td>
                                        <td className="px-4 py-3 text-[var(--muted)] font-sans max-w-sm">
                                            {log.reason || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-[var(--muted)] text-[10px]">
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
