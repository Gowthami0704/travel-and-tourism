import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Store,
    Users,
    Calendar,
    DollarSign,
    FileCheck2,
    AlertTriangle,
    MessageSquare,
    TrendingUp,
    Shield,
    Activity,
    ChevronRight,
    MapPin,
    ArrowUpRight,
    Sparkles
} from 'lucide-react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
    Legend
} from 'recharts';

export default function Dashboard({ stats = {}, charts = {}, activityFeed = [], recentBookings = [] }) {
    const isSuperAdmin = stats.isSuperAdmin;

    return (
        <AdminLayout
            title="Executive Tourism Command Center"
            subtitle="Real-time oversight of Tamil Nadu district tourism operations, vendors & traveler activity"
        >
            <Head title="Admin Command Center — TN Explore" />

            <div className="space-y-6">

                {/* 7 TOP STAT CARDS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5">
                    {/* Total Vendors */}
                    <div className="p-4 rounded-2xl bg-[#0E1526] border border-white/10 shadow-lg flex flex-col justify-between">
                        <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                            <span>Vendors</span>
                            <Store className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="text-2xl font-black text-white mt-2">{stats.totalVendors || 0}</div>
                        <Link href={route('admin.vendors.index')} className="text-[10px] text-cyan-400 hover:underline mt-1 flex items-center gap-0.5">
                            <span>Manage</span>
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {/* Pending KYC */}
                    <div className="p-4 rounded-2xl bg-[#0E1526] border border-amber-500/30 shadow-lg flex flex-col justify-between">
                        <div className="flex items-center justify-between text-amber-300 text-xs font-semibold">
                            <span>Pending KYC</span>
                            <FileCheck2 className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-2xl font-black text-amber-300 mt-2">{stats.pendingKyc || 0}</div>
                        <Link href={route('admin.kyc.index')} className="text-[10px] text-amber-400 hover:underline mt-1 flex items-center gap-0.5 font-bold">
                            <span>Verify Queue</span>
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {/* Total Users */}
                    <div className="p-4 rounded-2xl bg-[#0E1526] border border-white/10 shadow-lg flex flex-col justify-between">
                        <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                            <span>Travelers</span>
                            <Users className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-2xl font-black text-white mt-2">{stats.totalUsers || 0}</div>
                        <Link href={route('admin.users.index')} className="text-[10px] text-emerald-400 hover:underline mt-1 flex items-center gap-0.5">
                            <span>User List</span>
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {/* Total Bookings */}
                    <div className="p-4 rounded-2xl bg-[#0E1526] border border-white/10 shadow-lg flex flex-col justify-between">
                        <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                            <span>Bookings</span>
                            <Calendar className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="text-2xl font-black text-white mt-2">{stats.totalBookings || 0}</div>
                        <Link href={route('admin.bookings.index')} className="text-[10px] text-purple-400 hover:underline mt-1 flex items-center gap-0.5">
                            <span>Oversight</span>
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {/* Total Revenue */}
                    <div className="p-4 rounded-2xl bg-[#0E1526] border border-emerald-500/30 shadow-lg flex flex-col justify-between">
                        <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
                            <span>Revenue</span>
                            <DollarSign className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-xl font-black text-emerald-400 font-mono mt-2">
                            {isSuperAdmin ? `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}` : '🔒 Restricted'}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1">Confirmed total</span>
                    </div>

                    {/* Pending Reviews */}
                    <div className="p-4 rounded-2xl bg-[#0E1526] border border-white/10 shadow-lg flex flex-col justify-between">
                        <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                            <span>Reviews</span>
                            <MessageSquare className="w-4 h-4 text-gold" />
                        </div>
                        <div className="text-2xl font-black text-white mt-2">{stats.pendingReviews || 0}</div>
                        <Link href={route('admin.reviews.index')} className="text-[10px] text-gold hover:underline mt-1 flex items-center gap-0.5">
                            <span>Moderate</span>
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {/* Fraud Alerts */}
                    <div className="p-4 rounded-2xl bg-[#0E1526] border border-red-500/30 shadow-lg flex flex-col justify-between col-span-2 sm:col-span-1">
                        <div className="flex items-center justify-between text-red-400 text-xs font-semibold">
                            <span>Fraud Flags</span>
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                        </div>
                        <div className="text-2xl font-black text-red-400 mt-2">{stats.fraudAlerts || 0}</div>
                        <Link href={route('admin.fraud.index')} className="text-[10px] text-red-400 hover:underline mt-1 flex items-center gap-0.5 font-bold">
                            <span>AI Audit</span>
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                {/* 4 CHARTS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* CHART 1: LINE CHART — BOOKINGS PER DAY */}
                    <div className="p-5 rounded-2xl bg-[#0E1526] border border-white/10 shadow-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                    <span>Daily Bookings & Activity Trend (30 Days)</span>
                                </h3>
                                <p className="text-[11px] text-gray-400">Total reservation requests created across all 38 districts</p>
                            </div>
                        </div>

                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={charts.bookingTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '12px', fontSize: '11px' }}
                                    />
                                    <Line type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* CHART 2: BAR CHART — TOP 10 DISTRICTS */}
                    <div className="p-5 rounded-2xl bg-[#0E1526] border border-white/10 shadow-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gold" />
                                    <span>Top Districts by Tourist Reservations</span>
                                </h3>
                                <p className="text-[11px] text-gray-400">Most visited tourism destinations in Tamil Nadu</p>
                            </div>
                        </div>

                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts.topDistricts || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '12px', fontSize: '11px' }}
                                    />
                                    <Bar dataKey="bookings" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* CHART 3: PIE CHART — VENDOR SPECIALTY DISTRIBUTION */}
                    <div className="p-5 rounded-2xl bg-[#0E1526] border border-white/10 shadow-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Store className="w-4 h-4 text-cyan-400" />
                                    <span>Bookings by Service Specialty Type</span>
                                </h3>
                                <p className="text-[11px] text-gray-400">Distribution across Bus, Car, Guides, Packages and Homestays</p>
                            </div>
                        </div>

                        <div className="h-64 w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={charts.specialtyCounts || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {(charts.specialtyCounts || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '12px', fontSize: '11px' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* CHART 4: BAR CHART — TOP VENDORS BY REVENUE */}
                    <div className="p-5 rounded-2xl bg-[#0E1526] border border-white/10 shadow-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-emerald-400" />
                                    <span>Top Earning Vendors (Revenue Leaderboard)</span>
                                </h3>
                                <p className="text-[11px] text-gray-400">
                                    {isSuperAdmin ? 'Top revenue generators across all verified partners' : 'Restricted to Super Admin'}
                                </p>
                            </div>
                        </div>

                        {isSuperAdmin ? (
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        layout="vertical"
                                        data={charts.topVendorsRevenue || []}
                                        margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                        <XAxis type="number" stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `₹${(v/1000)}k`} />
                                        <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={9} width={90} />
                                        <Tooltip
                                            formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '12px', fontSize: '11px' }}
                                        />
                                        <Bar dataKey="revenue" fill="#10b981" radius={[0, 6, 6, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center text-gray-500 space-y-2">
                                <Shield className="w-8 h-8" />
                                <p className="text-xs">Financial performance data is restricted to Super Administrators.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* LIVE ACTIVITY FEED & RECENT BOOKINGS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Live Activity Stream */}
                    <div className="p-5 rounded-2xl bg-[#0E1526] border border-white/10 shadow-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Activity className="w-4 h-4 text-amber-400" />
                                <span>Administrative Activity Stream</span>
                            </h3>
                            {isSuperAdmin && (
                                <Link href={route('admin.audit.index')} className="text-xs text-amber-400 hover:underline">
                                    View Full Audit Log →
                                </Link>
                            )}
                        </div>

                        {activityFeed.length === 0 ? (
                            <p className="text-xs text-gray-500 py-8 text-center">No logged administrative actions yet.</p>
                        ) : (
                            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                                {activityFeed.map((log) => (
                                    <div key={log.id} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs flex items-start justify-between gap-3">
                                        <div>
                                            <div className="font-semibold text-gray-200">{log.action.replace(/_/g, ' ')}</div>
                                            <p className="text-gray-400 text-[11px] mt-0.5">{log.reason || 'System update'}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <span className="text-[10px] text-amber-300 font-bold block">{log.admin_name}</span>
                                            <span className="text-[9px] text-gray-500">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Bookings Queue */}
                    <div className="p-5 rounded-2xl bg-[#0E1526] border border-white/10 shadow-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-purple-400" />
                                <span>Recent Platform Reservations</span>
                            </h3>
                            <Link href={route('admin.bookings.index')} className="text-xs text-purple-400 hover:underline">
                                View All Bookings →
                            </Link>
                        </div>

                        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                            {recentBookings.map((b) => (
                                <div key={b.id} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs flex items-center justify-between gap-2">
                                    <div>
                                        <div className="font-semibold text-white">
                                            {b.customer_name || b.tourist?.name || 'Traveler'} ➔ {b.listing?.title}
                                        </div>
                                        <div className="text-[11px] text-gray-400 mt-0.5">
                                            Vendor: <strong className="text-gold">{b.listing?.vendor?.business_name}</strong>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className="font-mono font-bold text-emerald-400 block">₹{b.total_amount}</span>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                                            b.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-300' :
                                            b.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'
                                        }`}>
                                            {b.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
