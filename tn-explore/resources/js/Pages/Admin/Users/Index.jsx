import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Users,
    Search,
    ShieldAlert,
    Ban,
    CheckCircle2,
    Send,
    UserX,
    Calendar,
    Star,
    Mail,
    Phone,
    X
} from 'lucide-react';

export default function UserIndex({ users, filters = {}, isSuperAdmin }) {
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [warningTarget, setWarningTarget] = useState(null);
    const [warningMsg, setWarningMsg] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.users.index'), {
            search,
            role: roleFilter,
            status: statusFilter,
        }, { preserveState: true });
    };

    const handleToggleBan = (userId, userName, currentBanned) => {
        const actionText = currentBanned ? 'unban' : 'ban';
        const reason = prompt(`Reason for ${actionText}ning user '${userName}':`, 'Terms of Service Violation');
        if (reason !== null) {
            router.post(route('admin.users.toggleBan', userId), {
                reason: reason,
            }, { preserveScroll: true });
        }
    };

    const handleSendWarning = (e) => {
        e.preventDefault();
        if (!warningTarget || !warningMsg) return;
        router.post(route('admin.users.warn', warningTarget.id), {
            message: warningMsg,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setWarningTarget(null);
                setWarningMsg('');
            }
        });
    };

    return (
        <AdminLayout
            title="User & Tourist Directory"
            subtitle="Monitor platform participants, bookings engagement, and policy enforcement"
        >
            <Head title="User Management — Admin" />

            <div className="space-y-6">
                {/* Search & Filters */}
                <form onSubmit={handleSearch} className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-wrap items-center justify-between gap-3">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--muted)]" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone number..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] px-3 py-1.5 focus:outline-none focus:border-[var(--primary)]"
                        >
                            <option value="">All Roles</option>
                            <option value="tourist">Tourists</option>
                            <option value="vendor">Vendors</option>
                            <option value="admin">Administrators</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] px-3 py-1.5 focus:outline-none focus:border-[var(--primary)]"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="banned">Banned</option>
                        </select>

                        <button
                            type="submit"
                            className="px-3.5 py-1.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-bold text-xs cursor-pointer transition-all shadow-sm"
                        >
                            Filter
                        </button>
                    </div>
                </form>

                {/* Users Table */}
                <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-[var(--text)]">
                            <thead className="bg-[var(--bg)] text-[var(--muted)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border)]">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">User Name</th>
                                    <th className="px-4 py-3">Contact</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Reservations</th>
                                    <th className="px-4 py-3">Reviews</th>
                                    <th className="px-4 py-3">Account Status</th>
                                    <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {users.data?.map((u) => (
                                    <tr key={u.id} className="hover:bg-[var(--bg)] transition">
                                        <td className="px-4 py-3.5">
                                            <div className="font-bold text-[var(--text)] text-sm">{u.name}</div>
                                            <div className="text-[10px] text-[var(--muted)]">ID #{u.id}</div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="text-[var(--text)] flex items-center gap-1.5">
                                                <Mail className="w-3 h-3 text-[var(--primary)]" />
                                                <span>{u.email}</span>
                                            </div>
                                            <div className="text-[var(--muted)] flex items-center gap-1.5 mt-0.5">
                                                <Phone className="w-3 h-3 text-[var(--muted)]" />
                                                <span>{u.phone || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                u.role === 'admin' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                                                u.role === 'vendor' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20' :
                                                'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 font-semibold text-[var(--text)]">
                                            {u.bookings_count || 0} Bookings
                                        </td>
                                        <td className="px-4 py-3.5 font-semibold text-amber-500">
                                            ★ {u.reviews_count || 0}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                u.is_banned 
                                                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' 
                                                    : 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20'
                                            }`}>
                                                {u.is_banned ? 'Banned' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => setWarningTarget(u)}
                                                    className="px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--card)] text-[var(--text)] font-semibold text-[11px] transition cursor-pointer flex items-center gap-1 shadow-sm"
                                                >
                                                    <Send className="w-3 h-3 text-[var(--primary)]" />
                                                    <span>Warn</span>
                                                </button>

                                                {isSuperAdmin && u.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleToggleBan(u.id, u.name, u.is_banned)}
                                                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 shadow-sm ${
                                                            u.is_banned
                                                                ? 'bg-teal-600 hover:bg-teal-500 text-white'
                                                                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                                        }`}
                                                    >
                                                        <Ban className="w-3 h-3" />
                                                        <span>{u.is_banned ? 'Unban' : 'Ban'}</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SEND WARNING MODAL */}
                {warningTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                        <div className="relative w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 text-[var(--text)] space-y-4 shadow-xl">
                            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                                <h4 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
                                    <Send className="w-4 h-4 text-[var(--primary)]" />
                                    <span>Send Warning to {warningTarget.name}</span>
                                </h4>
                                <button onClick={() => setWarningTarget(null)} className="text-[var(--muted)] hover:text-[var(--text)]">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <textarea
                                rows="3"
                                required
                                placeholder="Enter specific reason or policy notice for this user..."
                                value={warningMsg}
                                onChange={(e) => setWarningMsg(e.target.value)}
                                className="w-full p-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
                            />
                            <div className="flex gap-2 justify-end pt-2">
                                <button onClick={() => setWarningTarget(null)} className="px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-xs">
                                    Cancel
                                </button>
                                <button onClick={handleSendWarning} className="px-3.5 py-1.5 rounded-lg bg-[var(--primary)] text-white font-bold text-xs">
                                    Send Warning
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
