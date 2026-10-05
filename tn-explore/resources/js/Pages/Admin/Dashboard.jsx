import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/UI/Card';
import KpiCard from '@/Components/UI/KpiCard';
import StatusChip from '@/Components/UI/StatusChip';
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
    Sparkles,
    Compass,
    CheckCircle2,
    Clock,
    X,
    ArrowRight,
    ShieldAlert,
    ShieldCheck,
    Search,
    Flame
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

export default function Dashboard({ stats = {}, charts = {}, activityFeed = [], recentBookings = [], pendingCustomTrips = [], aiBenchmark = {} }) {
    const isSuperAdmin = stats.isSuperAdmin;

    // Modal state for verifying a custom trip
    const [selectedTripToVerify, setSelectedTripToVerify] = useState(null);
    const [adminNotes, setAdminNotes] = useState('Verified by Admin. Released for verified local tour operator bids.');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successToast, setSuccessToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleOpenVerifyModal = (trip) => {
        setSelectedTripToVerify(trip);
        setAdminNotes(`Verified by Admin for ${trip.destination_region === 'inside_tn' ? 'Tamil Nadu' : 'Interstate'} route. Open for operator proposals.`);
    };

    const handleConfirmVerify = (e) => {
        e.preventDefault();
        if (!selectedTripToVerify) return;

        setIsSubmitting(true);
        router.post(route('admin.custom-trips.verify', selectedTripToVerify.id), {
            admin_notes: adminNotes,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                const verifiedTitle = selectedTripToVerify.title;
                setSelectedTripToVerify(null);
                setIsSubmitting(false);
                setSuccessToast(`✓ Custom Trip "${verifiedTitle}" verified successfully! Now published live to vendors.`);
                setTimeout(() => setSuccessToast(null), 6000);
            },
            onError: () => setIsSubmitting(false),
        });
    };

    const filteredTrips = pendingCustomTrips.filter(t => 
        !searchQuery || 
        (t.title && t.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.source_district && t.source_district.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.destination_district && t.destination_district.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.user?.name && t.user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <AdminLayout
            title="Executive Tourism Command Center"
            subtitle="Real-time oversight of Tamil Nadu district tourism operations, vendors & traveler activity"
        >
            <Head title="Admin Command Center — TN Explore" />

            {/* Success Toast */}
            {successToast && (
                <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-3 animate-bounce">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{successToast}</span>
                    <button type="button" onClick={() => setSuccessToast(null)} className="ml-2 hover:opacity-75 cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="space-y-6">

                {/* 2-BOX ACTION-FIRST TRIAGE HEADER */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    
                    {/* 1. AI ISOLATION FOREST FRAUD DEFENSE RADAR */}
                    <Card className="flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--verified)]/15 text-[var(--verified)] flex items-center justify-center">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-[var(--verified)] uppercase tracking-wider">AI Trust & Fraud Defense</span>
                                </div>
                                <StatusChip
                                    status="verified"
                                    label={`${aiBenchmark?.f1_score || '0.946'} F1-Score`}
                                    size="xs"
                                />
                            </div>

                            <h3 className="text-xl font-serif font-bold text-[var(--text)]">
                                Isolation Forest ML Anomaly Engine
                            </h3>

                            <p className="text-xs text-[var(--muted)] leading-relaxed">
                                Real-time monitoring of {stats.totalVendors || 24} registered vendors across 38 districts. Evaluated on {aiBenchmark?.total_samples || 1200} benchmark records (Precision: {aiBenchmark?.precision || '89.7%'}, Recall: {aiBenchmark?.recall || '94.1%'}).
                            </p>
                        </div>

                        <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1.5 text-[var(--text)] font-mono font-medium">
                                    <ShieldCheck className="w-4 h-4 text-[var(--verified)]" />
                                    <span>{stats.totalVendors ? stats.totalVendors - (stats.fraudAlerts || 0) : 24} Safe</span>
                                </span>
                                {stats.fraudAlerts > 0 && (
                                    <span className="flex items-center gap-1.5 text-rose-600 font-mono font-bold">
                                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                                        <span>{stats.fraudAlerts} Flagged</span>
                                    </span>
                                )}
                            </div>

                            <Link
                                href={route('admin.fraud.index')}
                                className="px-3.5 py-1.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-[var(--primary-text)] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                            >
                                <span>Fraud Review Hub</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </Card>

                    {/* 2. PENDING KYC & CUSTOM TRIP TRIAGE BOX */}
                    <Card className="flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                        <FileCheck2 className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Verification Queue</span>
                                </div>
                                <StatusChip
                                    status="pending"
                                    label={`${(stats.pendingKyc || 0) + (pendingCustomTrips?.length || 0)} Pending`}
                                    size="xs"
                                />
                            </div>

                            <h3 className="text-xl font-serif font-bold text-[var(--text)]">
                                KYC Approvals & Custom Itineraries
                            </h3>

                            <p className="text-xs text-[var(--muted)] leading-relaxed">
                                {pendingCustomTrips?.length || 0} tourist itinerary requests awaiting verification to open for vendor quotes, plus {stats.pendingKyc || 0} vendor licenses.
                            </p>
                        </div>

                        <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <Link
                                    href={route('admin.kyc.index')}
                                    className="text-amber-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1"
                                >
                                    <span>KYC Audit ({stats.pendingKyc || 0})</span>
                                </Link>
                            </div>

                            <Link
                                href={route('admin.custom-trips.index')}
                                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                            >
                                <span>Verify Trips Queue</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </Card>
                </div>

                {/* 8 TOP STAT CARDS USING UNIVERSAL KPICARD */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KpiCard
                        title="Custom Trips"
                        value={stats.pendingCustomTrips || 0}
                        icon={Compass}
                        variant={(stats.pendingCustomTrips || 0) > 0 ? 'pending' : 'neutral'}
                        actionHref={route('admin.custom-trips.index')}
                        actionLabel="Verify"
                    />

                    <KpiCard
                        title="Vendors"
                        value={stats.totalVendors || 0}
                        icon={Store}
                        variant="neutral"
                        actionHref={route('admin.vendors.index')}
                        actionLabel="Manage"
                    />

                    <KpiCard
                        title="Pending KYC"
                        value={stats.pendingKyc || 0}
                        icon={FileCheck2}
                        variant={(stats.pendingKyc || 0) > 0 ? 'pending' : 'neutral'}
                        actionHref={route('admin.kyc.index')}
                        actionLabel="Verify"
                    />

                    <KpiCard
                        title="Travelers"
                        value={stats.totalUsers || 0}
                        icon={Users}
                        variant="neutral"
                        actionHref={route('admin.users.index')}
                        actionLabel="Directory"
                    />

                    <KpiCard
                        title="Bookings"
                        value={stats.totalBookings || 0}
                        icon={Calendar}
                        variant="neutral"
                        actionHref={route('admin.bookings.index')}
                        actionLabel="Oversight"
                    />

                    <KpiCard
                        title="Revenue"
                        value={isSuperAdmin ? `₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN')}` : 'Restricted'}
                        icon={DollarSign}
                        variant="neutral"
                        subtext="Confirmed Total"
                    />

                    <KpiCard
                        title="Reviews"
                        value={stats.pendingReviews || 0}
                        icon={MessageSquare}
                        variant={(stats.pendingReviews || 0) > 0 ? 'pending' : 'neutral'}
                        actionHref={route('admin.reviews.index')}
                        actionLabel="Moderate"
                    />

                    <KpiCard
                        title="Fraud Flags"
                        value={stats.fraudAlerts || 0}
                        icon={AlertTriangle}
                        variant={(stats.fraudAlerts || 0) > 0 ? 'danger' : 'neutral'}
                        actionHref={route('admin.fraud.index')}
                        actionLabel="AI Audit"
                    />
                </div>

                {/* USER CUSTOM TRIPS AWAITING ADMIN VERIFICATION */}
                {pendingCustomTrips && pendingCustomTrips.length > 0 && (
                    <Card className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-[var(--verified)]/15 border border-[var(--verified)]/30 flex items-center justify-center text-[var(--verified)]">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-serif font-bold text-base text-[var(--text)] flex items-center gap-2">
                                        <span>Custom Trips Awaiting Verification</span>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[var(--primary)] text-[var(--primary-text)]">
                                            {pendingCustomTrips.length} Ready
                                        </span>
                                    </h3>
                                    <p className="text-xs text-[var(--muted)]">
                                        Once verified, requests are published to certified vendors in <strong className="text-[var(--text)]">/vendor/opportunities</strong>.
                                    </p>
                                </div>
                            </div>
                            
                            {/* Search Filter */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Filter by district or tourist..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="px-3 py-1.5 pl-8 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
                                />
                                <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-2.5 top-2.5" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {filteredTrips.slice(0, 6).map((trip) => (
                                <div
                                    key={trip.id}
                                    className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--muted)] transition-all flex flex-col justify-between gap-3 shadow-xs"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                            <StatusChip
                                                status="pending"
                                                label="Pending Verification"
                                                size="xs"
                                            />
                                            <span className="text-[10px] text-[var(--muted)] font-medium">
                                                {trip.destination_region === 'inside_tn' ? 'Inside TN' : 'Outside TN'}
                                            </span>
                                        </div>

                                        <h4 className="font-serif font-bold text-sm text-[var(--text)] line-clamp-1">
                                            {trip.title || 'Custom Tamil Nadu Experience'}
                                        </h4>

                                        <p className="text-xs text-[var(--verified)] font-medium mt-0.5">
                                            {trip.source_district || 'Chennai'} → {trip.destination_district || 'Madurai'}
                                        </p>

                                        <div className="mt-2.5 pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted)]">
                                            <span>{trip.number_of_travelers || 2} Travelers • {trip.duration_days || 3} Days</span>
                                            <span className="font-bold text-[var(--text)] font-mono">
                                                ₹{trip.budget_estimate ? Number(trip.budget_estimate).toLocaleString('en-IN') : 'Flexible'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1 border-t border-[var(--border)]">
                                        <span className="text-[11px] text-[var(--muted)]">
                                            By: <strong className="text-[var(--text)]">{trip.user?.name || 'Tourist'}</strong>
                                        </span>
                                        <button
                                            onClick={() => handleOpenVerifyModal(trip)}
                                            className="px-3.5 py-1.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-[var(--primary-text)] font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>Verify & Release</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* CHARTS ROW WITH THEME TOKENS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Trends Chart */}
                    <Card className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-serif font-bold text-base text-[var(--text)] flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-[var(--verified)]" />
                                <span>Platform Booking Growth & Revenue</span>
                            </h3>
                            <span className="text-xs text-[var(--muted)] font-mono">Monthly Metrics</span>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={charts.revenueData || [
                                    { month: 'Jan', revenue: 120000, bookings: 45 },
                                    { month: 'Feb', revenue: 190000, bookings: 72 },
                                    { month: 'Mar', revenue: 240000, bookings: 98 },
                                    { month: 'Apr', revenue: 310000, bookings: 130 },
                                    { month: 'May', revenue: 420000, bookings: 175 }
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="month" stroke="var(--muted)" fontSize={11} />
                                    <YAxis stroke="var(--muted)" fontSize={11} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* District Demand Chart */}
                    <Card className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-serif font-bold text-base text-[var(--text)] flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[var(--primary)]" />
                                <span>District Footfall & Circuit Demand</span>
                            </h3>
                            <span className="text-xs text-[var(--muted)] font-mono">Top 5 Districts</span>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts.districtDemand || [
                                    { district: 'Madurai', visits: 480 },
                                    { district: 'Chennai', visits: 410 },
                                    { district: 'Nilgiris', visits: 390 },
                                    { district: 'Thanjavur', visits: 340 },
                                    { district: 'Kanyakumari', visits: 290 }
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="district" stroke="var(--muted)" fontSize={11} />
                                    <YAxis stroke="var(--muted)" fontSize={11} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="visits" fill="var(--verified)" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

            </div>

            {/* VERIFY MODAL */}
            {selectedTripToVerify && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl max-w-lg w-full p-6 text-[var(--text)] space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-[var(--verified)]" />
                                <h3 className="font-serif font-bold text-base">Verify Custom Itinerary</h3>
                            </div>
                            <button onClick={() => setSelectedTripToVerify(null)} className="text-[var(--muted)] hover:text-[var(--text)] cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-3.5 bg-[var(--bg)] rounded-2xl border border-[var(--border)] space-y-1 text-xs">
                            <p className="font-bold text-[var(--text)] text-sm">{selectedTripToVerify.title}</p>
                            <p className="text-[var(--muted)]">
                                Route: <span className="text-[var(--verified)] font-semibold">{selectedTripToVerify.source_district} → {selectedTripToVerify.destination_district}</span>
                            </p>
                            <p className="text-[var(--muted)]">
                                Travelers: <span className="text-[var(--text)] font-semibold">{selectedTripToVerify.number_of_travelers || 2}</span> • Budget: <span className="text-[var(--primary)] font-semibold font-mono">₹{selectedTripToVerify.budget_estimate || 'Flexible'}</span>
                            </p>
                        </div>

                        <form onSubmit={handleConfirmVerify} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                                    Official Tourism Board Sign-Off Note
                                </label>
                                <textarea
                                    rows={3}
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="w-full p-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedTripToVerify(null)}
                                    className="flex-1 py-2.5 rounded-xl bg-[var(--bg)] hover:bg-[var(--border)] text-[var(--muted)] text-xs font-semibold cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-2 py-2.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-[var(--primary-text)] font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                                >
                                    <span>{isSubmitting ? 'Verifying...' : 'Approve & Publish to Vendors'}</span>
                                    <CheckCircle2 className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
