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
    Phone
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
                <form onSubmit={handleSearch} className="p-4 rounded-2xl bg-[#0E1526] border border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone number..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="bg-slate-950 border border-white/10 rounded-xl text-xs text-gray-300 px-3 py-1.5 focus:outline-none"
                        >
                            <option value="">All Roles</option>
                            <option value="tourist">Tourists</option>
                            <option value="vendor">Vendors</option>
                            <option value="admin">Administrators</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-950 border border-white/10 rounded-xl text-xs text-gray-300 px-3 py-1.5 focus:outline-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="banned">Banned</option>
                        </select>

                        <button
                            type="submit"
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-all"
                        >
                            Filter
                        </button>
                    </div>
                </form>

                {/* Users Table */}
                <div className="p-6 rounded-2xl bg-[#0E1526] border border-white/10 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-gray-300">
                            <thead className="bg-white/5 text-gray-400 uppercase text-[10px] font-bold tracking-wider">
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
                            <tbody className="divide-y divide-white/5">
                                {users.data?.map((u) => (
                                    <tr key={u.id} className="hover:bg-white/5 transition">
                                        <td className="px-4 py-3.5">
                                            <div className="font-bold text-white text-sm">{u.name}</div>
                                            <div className="text-[10px] text-gray-500">ID #{u.id}</div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="text-gray-300 flex items-center gap-1.5">
                                                <Mail className="w-3 h-3 text-gold" />
                                                <span>{u.email}</span>
                                            </div>
                                            <div className="text-gray-400 flex items-center gap-1.5 mt-0.5">
                                                <Phone className="w-3 h-3 text-gray-500" />
                                                <span>{u.phone || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                u.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                                u.role === 'vendor' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                                                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 font-semibold text-white">
                                            {u.bookings_count || 0} Bookings
                                        </td>
                                        <td className="px-4 py-3.5 font-semibold text-gold">
                                            ★ {u.reviews_count || 0}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                u.is_banned ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300'
                                            }`}>
                                                {u.is_banned ? 'Banned' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => setWarningTarget(u)}
                                                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-[11px] transition cursor-pointer flex items-center gap-1"
                                                >
                                                    <Send className="w-3 h-3" />
                                                    <span>Warn</span>
                                                </button>

                                                {isSuperAdmin && u.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleToggleBan(u.id, u.name, u.is_banned)}
                                                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
                                                            u.is_banned
                                                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                                                : 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                        <div className="relative w-full max-w-md bg-[#0E1526] border border-white/10 rounded-2xl p-6 text-white space-y-4">
                            <h4 className="text-base font-bold text-white flex items-center gap-2">
                                <Send className="w-4 h-4 text-amber-400" />
                                <span>Send Warning to {warningTarget.name}</span>
                            </h4>
                            <textarea
                                rows="3"
                                required
                                placeholder="Enter specific reason or policy notice for this user..."
                                value={warningMsg}
                                onChange={(e) => setWarningMsg(e.target.value)}
                                className="w-full p-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                            />
                            <div className="flex gap-2 justify-end">
                                <button onClick={() => setWarningTarget(null)} className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 text-xs">
                                    Cancel
                                </button>
                                <button onClick={handleSendWarning} className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs">
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
