import React, { useState, useMemo } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import {
    Calendar,
    Compass,
    Sparkles,
    CheckCircle2,
    Clock,
    MapPin,
    Award,
    Star,
    MessageSquare,
    ArrowRight,
    ExternalLink,
    ShieldCheck,
    X,
    Search,
    Utensils,
    Building,
    SlidersHorizontal
} from 'lucide-react';
import { getImage, handleImageError, cleanName } from '@/Utils/imageFallback';

export default function Dashboard({
    customTrips = [],
    bookings = [],
    reviews = [],
    districts = [],
    regions = ['All', 'North', 'South', 'Kongu', 'Central', 'Coastal'],
    recommendedHiddenGems = [],
    stats = {}
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    // Default to 'customTrips' if user has recent custom trips, or 'districts', or tab from query string
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const requestedTab = params.get('tab');
            if (requestedTab) return requestedTab;
        }
        return customTrips.length > 0 ? 'customTrips' : 'districts';
    });

    React.useEffect(() => {
        // Handle direct query param on render / update
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const requestedTab = params.get('tab');
            if (requestedTab && requestedTab !== activeTab) {
                setActiveTab(requestedTab);
            }
        }

        const handleTabSwitch = (e) => {
            if (e.detail?.tab) {
                setActiveTab(e.detail.tab);
                const target = document.getElementById('dashboard-tabs-container') || document.getElementById('bookings-section');
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        };

        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            const requestedTab = params.get('tab');
            if (requestedTab) setActiveTab(requestedTab);
        };

        window.addEventListener('switch_dashboard_tab', handleTabSwitch);
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('switch_dashboard_tab', handleTabSwitch);
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('All');

    const [reviewModalVendor, setReviewModalVendor] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        vendor_id: '',
        rating: 5,
        comment: '',
    });

    // Filter districts based on search & region
    const filteredDistricts = useMemo(() => {
        return districts.filter((d) => {
            const matchesSearch =
                d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesRegion = selectedRegion === 'All' || d.region === selectedRegion;
            return matchesSearch && matchesRegion;
        });
    }, [districts, searchQuery, selectedRegion]);

    const openReviewModal = (vendor) => {
        setReviewModalVendor(vendor);
        setData('vendor_id', vendor.id);
    };

    const closeReviewModal = () => {
        setReviewModalVendor(null);
        reset();
    };

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        post(route('reviews.store'), {
            onSuccess: () => closeReviewModal(),
        });
    };

    const handleAcceptProposal = (tripId, proposalId, price, vendorName, hasOtherAccepted, currentVendorName) => {
        let msg = `Are you sure you want to accept ${vendorName || 'this vendor'}'s quote for ₹${Number(price).toLocaleString()} and finalize the booking?`;
        if (hasOtherAccepted) {
            msg = `You already have ${currentVendorName || 'another vendor'} accepted.\n\nDo you want to switch to ${vendorName || 'this vendor'} for ₹${Number(price).toLocaleString()}?\n(Only 1 vendor can be active at a time).`;
        }
        if (confirm(msg)) {
            router.post(route('custom-trips.accept', [tripId, proposalId]), {}, { preserveScroll: true });
        }
    };

    const handleDismissProposal = (tripId, proposalId, vendorName, isAccepted) => {
        const msg = isAccepted
            ? `Are you sure you want to dismiss ${vendorName || 'this vendor'} as the active vendor?\n\nThis will re-open all proposals for this trip so you can select another vendor.`
            : `Are you sure you want to dismiss the proposal from ${vendorName || 'this vendor'}?`;
        if (confirm(msg)) {
            router.post(route('custom-trips.dismiss', [tripId, proposalId]), {}, { preserveScroll: true });
        }
    };

    const statusBadge = {
        pending: { label: 'Awaiting Vendor Confirmation', color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
        accepted: { label: 'Confirmed & Accepted', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
        rejected: { label: 'Declined by Vendor', color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' },
        completed: { label: 'Trip Completed', color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' },
    };

    const customTripStatusBadge = {
        pending_verification: { label: '⏳ Pending Admin Verification', color: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
        verified_active: { label: '✨ Verified - Open for Vendor Quotes', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
        verified: { label: '✨ Verified - Open for Vendor Quotes', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
        booked: { label: '🎉 Booked & Confirmed', color: 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800' },
        rejected: { label: '❌ Declined', color: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' },
        closed: { label: '🔒 Closed', color: 'bg-stone-100 text-stone-700 border-stone-300 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700' },
    };

    return (
        <MainLayout>
            <Head title="User Dashboard — Explore All 38 Districts & Custom Trips | TN Explore" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* HERO WELCOME BANNER */}
                <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                Tourist & Explorer Role Active
                            </span>
                        </div>
                        <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-stone-900 dark:text-white">
                            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 dark:from-gold-light dark:via-white dark:to-gold">{user?.name || 'Explorer'}</span>!
                        </h1>
                        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1 max-w-xl leading-relaxed">
                            Explore all <strong className="text-amber-700 dark:text-gold">38 Districts</strong> of Tamil Nadu, custom trip planner (Inside TN & Kerala/Outside TN), vendor quotes, and live reservation tracking.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-wrap items-center gap-3">
                        <Link
                            href={route('custom-trips.create')}
                            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>+ Plan Custom Trip</span>
                        </Link>
                        <Link
                            href="/"
                            className="px-5 py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 dark:bg-gradient-to-r dark:from-gold dark:via-amber-300 dark:to-gold dark:text-[#0A0E1A] font-bold text-xs shadow-md hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Compass className="w-4 h-4" />
                            <span>Frontpage Explorer</span>
                        </Link>
                    </div>
                </div>

                {/* 4 LIVE STATS COUNTERS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm hover:border-amber-400 hover:shadow-md transition-all">
                        <span className="text-[11px] text-amber-700 dark:text-gold font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            Districts Loaded
                        </span>
                        <div className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white mt-1">
                            {districts.length} / 38
                        </div>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400">100% Tamil Nadu Coverage</span>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all">
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            Custom Trip Requests
                        </span>
                        <div className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                            {customTrips.length}
                        </div>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400">Inside TN & Outside TN</span>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm hover:border-cyan-400 hover:shadow-md transition-all">
                        <span className="text-[11px] text-cyan-700 dark:text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            Active Bookings
                        </span>
                        <div className="font-display text-2xl sm:text-3xl font-extrabold text-cyan-700 dark:text-cyan-400 mt-1">
                            {stats.activeBookings || 0}
                        </div>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400">Confirmed Reservations</span>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm hover:border-amber-400 hover:shadow-md transition-all">
                        <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5" />
                            My Reviews
                        </span>
                        <div className="font-display text-2xl sm:text-3xl font-extrabold text-amber-700 dark:text-amber-400 mt-1">
                            {stats.totalReviews || 0}
                        </div>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400">Verified Feedback</span>
                    </div>
                </div>

                {/* NAVIGATION TABS (My Custom Trips / All 38 Districts / My Bookings / My Reviews) */}
                <div id="dashboard-tabs-container" className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-3 overflow-x-auto scroll-mt-24">
                    <button
                        type="button"
                        onClick={() => setActiveTab('customTrips')}
                        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                            activeTab === 'customTrips'
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/20 font-extrabold'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
                        }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>My Custom Trips ({customTrips.length})</span>
                        {customTrips.length > 0 && (
                            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-900 text-white font-bold ml-0.5">
                                {customTrips.length}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('districts')}
                        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                            activeTab === 'districts'
                                ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
                        }`}
                    >
                        <MapPin className="w-4 h-4" />
                        <span>All 38 Districts ({districts.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('bookings')}
                        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                            activeTab === 'bookings'
                                ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
                        }`}
                    >
                        <Calendar className="w-4 h-4" />
                        <span>My Bookings ({bookings.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('reviews')}
                        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                            activeTab === 'reviews'
                                ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
                        }`}
                    >
                        <Star className="w-4 h-4" />
                        <span>My Reviews ({reviews.length})</span>
                    </button>
                </div>

                {/* TAB 0: CUSTOM TRIP REQUESTS & VENDOR QUOTES */}
                {activeTab === 'customTrips' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <h2 className="font-display text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
                                        Custom Trip Requests & Vendor Quotes ({customTrips.length})
                                    </h2>
                                </div>
                                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                                    Track verification status, review operator proposals, and chat directly with verified regional vendors.
                                </p>
                            </div>
                            <Link
                                href={route('custom-trips.create')}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>+ Request New Custom Trip</span>
                            </Link>
                        </div>

                        {customTrips.length > 0 ? (
                            <div className="space-y-4">
                                {customTrips.map((trip) => {
                                    const st = customTripStatusBadge[trip.status] || { label: trip.status, color: 'bg-stone-100 text-stone-800 border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700' };
                                    const destinationsList = Array.isArray(trip.destinations) ? trip.destinations : [];
                                    const fromEntry = destinationsList.find(d => typeof d === 'string' && d.startsWith('From:'))?.replace('From:', '').trim();
                                    const toEntry = destinationsList.find(d => typeof d === 'string' && d.startsWith('To:'))?.replace('To:', '').trim();
                                    const interestsEntry = destinationsList.find(d => typeof d === 'string' && d.startsWith('Interests:'))?.replace('Interests:', '').trim();

                                    return (
                                        <div
                                            key={trip.id}
                                            className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-emerald-400/80 transition-all shadow-md hover:shadow-xl space-y-4"
                                        >
                                            {/* Trip Header */}
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${st.color}`}>
                                                            {st.label}
                                                        </span>
                                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                            User ID: #{trip.user_id || user?.id}
                                                        </span>
                                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400">
                                                            Trip #{trip.id}
                                                        </span>
                                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
                                                            {trip.destination_region === 'inside_tn' ? '🏛️ Inside Tamil Nadu' : '🌴 Outside TN (Kerala/Interstate)'}
                                                        </span>
                                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 capitalize">
                                                            👥 {trip.trip_type?.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-display text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
                                                        {trip.title}
                                                    </h3>
                                                </div>

                                                <div className="flex items-center gap-2.5 shrink-0">
                                                    <Link
                                                        href={route('custom-trips.show', trip.id)}
                                                        className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                                                    >
                                                        <span>View Details & Quotes</span>
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <Link
                                                        href={route('trip-chats.index')}
                                                        className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium border border-stone-200 dark:border-stone-700 transition-all flex items-center gap-1.5"
                                                    >
                                                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                        <span>Chat</span>
                                                    </Link>
                                                </div>
                                            </div>

                                            {/* Status Explanation Banner */}
                                            {trip.status === 'pending_verification' && (
                                                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                                                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                                    <div>
                                                        <strong>Under Admin Verification:</strong> Our platform administrators are checking your route safety and details. Once verified, certified regional tour operators will immediately submit customized quotes.
                                                    </div>
                                                </div>
                                            )}

                                            {(trip.status === 'verified_active' || trip.status === 'verified') && (
                                                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                                    <div>
                                                        <strong>Request is Verified & Live!</strong> Local tour operators are actively reviewing your trip and submitting custom bids with vehicle, stay, and inclusions.
                                                    </div>
                                                </div>
                                            )}

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#FAF7F0] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs">
                                                <div>
                                                    <span className="text-stone-500 dark:text-stone-400 block text-[10px] uppercase font-semibold">Route (From ➔ To)</span>
                                                    <span className="font-bold text-stone-900 dark:text-white">
                                                        {fromEntry ? `${fromEntry} ➔ ${toEntry}` : destinationsList[0] || 'Flexible'}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span className="text-stone-500 dark:text-stone-400 block text-[10px] uppercase font-semibold">Duration & Travelers</span>
                                                    <span className="font-bold text-stone-900 dark:text-white">
                                                        {trip.duration_days} Days • {trip.adults_count} Adults {trip.children_count > 0 ? `+ ${trip.children_count} Kids` : ''}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span className="text-stone-500 dark:text-stone-400 block text-[10px] uppercase font-semibold">Budget Bracket</span>
                                                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                                        ₹{Number(trip.budget_min).toLocaleString()} - ₹{Number(trip.budget_max).toLocaleString()}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span className="text-stone-500 dark:text-stone-400 block text-[10px] uppercase font-semibold">Proposals Received</span>
                                                    <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                                        <Sparkles className="w-3.5 h-3.5" />
                                                        {(trip.proposals?.length || trip.proposals_count || 0)} Quotes Received
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Received Proposals Accordion / List if any */}
                                            {trip.proposals && trip.proposals.length > 0 && (
                                                <div className="space-y-2.5 pt-2">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                                                            <Building className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                            Submitted Vendor Proposals ({trip.proposals.length}):
                                                        </span>
                                                        <Link
                                                            href={route('custom-trips.show', trip.id)}
                                                            className="text-emerald-700 dark:text-emerald-400 hover:underline text-[11px] font-semibold"
                                                        >
                                                            View Full Details & Compare →
                                                        </Link>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {trip.proposals.map((prop) => (
                                                            <div
                                                                key={prop.id}
                                                                className="p-3.5 rounded-2xl bg-[#FAF7F0] dark:bg-stone-850 border border-stone-200 dark:border-stone-700 flex flex-col justify-between gap-3 shadow-sm"
                                                            >
                                                                <div>
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <div>
                                                                            <h4 className="font-bold text-stone-900 dark:text-white text-xs">
                                                                                {prop.vendor?.business_name || 'Verified Vendor'}
                                                                            </h4>
                                                                            <span className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
                                                                                <MapPin className="w-2.5 h-2.5 text-amber-600" />
                                                                                <span>{prop.vendor?.district?.name || 'Local Operator'}</span>
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                                                                            ₹{Number(prop.quote_price).toLocaleString()}
                                                                        </span>
                                                                    </div>

                                                                    {Array.isArray(prop.inclusions) && prop.inclusions.length > 0 && (
                                                                        <div className="mt-2 text-[11px] text-stone-600 dark:text-stone-300 space-y-0.5 line-clamp-2">
                                                                            {prop.inclusions.slice(0, 2).map((inc, i) => (
                                                                                <div key={i} className="truncate text-stone-700 dark:text-stone-300">
                                                                                    ✓ {inc}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-200 dark:border-stone-700">
                                                                    {prop.status === 'accepted' ? (
                                                                        <>
                                                                            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-[10px] border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                                                                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                                                                Accepted Vendor
                                                                            </span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleDismissProposal(trip.id, prop.id, prop.vendor?.business_name, true)}
                                                                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-semibold transition-all cursor-pointer"
                                                                                title="Dismiss this accepted vendor to re-open all proposals"
                                                                            >
                                                                                ✕ Dismiss / Change
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleAcceptProposal(trip.id, prop.id, prop.quote_price, prop.vendor?.business_name, trip.status === 'booked', trip.proposals?.find(p => p.status === 'accepted')?.vendor?.business_name)}
                                                                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] shadow-sm transition-all cursor-pointer"
                                                                            >
                                                                                {trip.status === 'booked' ? 'Switch' : '✓ Accept Quote'}
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleDismissProposal(trip.id, prop.id, prop.vendor?.business_name, false)}
                                                                                className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-rose-700 dark:bg-stone-800 dark:text-stone-400 text-[11px] transition-all cursor-pointer border border-stone-200 dark:border-stone-700"
                                                                                title="Dismiss this proposal"
                                                                            >
                                                                                ✕ Dismiss
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    <Link
                                                                        href={route('custom-trips.show', trip.id)}
                                                                        className="flex-1 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-[11px] text-center transition-all border border-stone-200 dark:border-stone-700"
                                                                    >
                                                                        Details →
                                                                    </Link>
                                                                    {prop.chat && (
                                                                        <Link
                                                                            href={route('trip-chats.show', prop.chat.id)}
                                                                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-emerald-600 dark:text-emerald-400 text-[11px] transition-all border border-stone-200 dark:border-stone-700"
                                                                            title="Chat with Vendor"
                                                                        >
                                                                            <MessageSquare className="w-3.5 h-3.5" />
                                                                        </Link>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {interestsEntry && (
                                                <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300">
                                                    <span className="text-stone-500 dark:text-stone-400">Preferred Vibes:</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {interestsEntry.split(',').map((tag, idx) => (
                                                            <span key={idx} className="px-2 py-0.5 rounded-lg bg-[#FAF7F0] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                                                                ✨ {tag.trim().replace('_', ' ')}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-10 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 space-y-4 shadow-sm">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                                    <Sparkles className="w-7 h-7" />
                                </div>
                                <h3 className="font-display text-lg font-bold text-stone-900 dark:text-white">
                                    No Custom Trip Requests Yet
                                </h3>
                                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
                                    Planning a family vacation, friends trek, or solo escape inside Tamil Nadu or Outside TN (Kerala, Karnataka)? Submit a custom request to get quotes from verified operators!
                                </p>
                                <Link
                                    href={route('custom-trips.create')}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 hover:scale-105 transition-all cursor-pointer"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span>Plan Your Custom Trip Now</span>
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 1: ALL 38 DISTRICTS EXPLORER */}
                {activeTab === 'districts' && (
                    <div className="space-y-6">
                        {/* SEARCH & REGION CONTROLS */}
                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm">
                            {/* Search Input */}
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search any of the 38 districts (e.g. Madurai, Nilgiris, Thanjavur, Chennai)..."
                                    className="w-full pl-10 pr-4 py-2 bg-[#FAF7F0] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-white text-xs"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Region Filter Buttons */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                                {regions.map((reg) => (
                                    <button
                                        key={reg}
                                        type="button"
                                        onClick={() => setSelectedRegion(reg)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                            selectedRegion === reg
                                                ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700'
                                                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-stone-700'
                                        }`}
                                    >
                                        {reg === 'All' ? 'All (38)' : reg}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* DISTRICTS GRID (ALL 38) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                            {filteredDistricts.map((d) => {
                                const img = getImage(d, 'district');
                                return (
                                    <Link
                                        key={d.id}
                                        href={`/district/${d.id}`}
                                        className="group relative rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-amber-400 shadow-sm hover:shadow-xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5"
                                    >
                                        {/* Image Box */}
                                        <div className="relative h-44 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                                            <img
                                                src={img}
                                                alt={d.name}
                                                onError={(e) => handleImageError(e, 'heritage')}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />

                                            {/* Region Badge */}
                                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                                                {d.region} TN
                                            </span>

                                            {/* Hidden Gem Count Pill */}
                                            {d.hidden_gems_count > 0 && (
                                                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-purple-950/80 backdrop-blur-md border border-purple-400/40 text-[10px] font-bold text-purple-200 flex items-center gap-1">
                                                    <Sparkles className="w-2.5 h-2.5" />
                                                    {d.hidden_gems_count} Gems
                                                </span>
                                            )}
                                        </div>

                                        {/* Content Box */}
                                        <div className="p-4 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-display font-bold text-base text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                                                    {cleanName(d.name)}
                                                </h3>
                                                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                                                    {d.description || 'Explore rich temples, heritage sites, waterfalls, and local food.'}
                                                </p>
                                            </div>

                                            {/* Counts Strip */}
                                            <div className="mt-3.5 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-300">
                                                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                                                    <MapPin className="w-3 h-3" />
                                                    {d.places_count || 0} Places
                                                </span>
                                                <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
                                                    <Utensils className="w-3 h-3" />
                                                    {d.food_dishes_count || 0} Foods
                                                </span>
                                                <span className="flex items-center gap-1 text-cyan-700 dark:text-cyan-400 font-semibold">
                                                    <Building className="w-3 h-3" />
                                                    {d.vendors_count || 0} Stays
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {filteredDistricts.length === 0 && (
                            <div className="p-10 text-center rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-500 space-y-2 shadow-sm">
                                <p className="text-sm font-bold text-stone-900 dark:text-white">No districts matched "{searchQuery}"</p>
                                <p className="text-xs">Try searching for Chennai, Madurai, Nilgiris, Thanjavur, or Coimbatore.</p>
                                <button
                                    type="button"
                                    onClick={() => { setSearchQuery(''); setSelectedRegion('All'); }}
                                    className="mt-2 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: MY BOOKINGS */}
                {activeTab === 'bookings' && (
                    <div id="bookings-section" className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-6 shadow-md scroll-mt-24">
                        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800 mb-5">
                            <div>
                                <h2 className="font-display text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    My Tour & Stay Reservations
                                </h2>
                                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                                    Live reservation tracking with local hosts and tour operators
                                </p>
                            </div>
                        </div>

                        {bookings.length > 0 ? (
                            <div className="space-y-4">
                                {bookings.map((booking) => {
                                    const status = statusBadge[booking.status] || statusBadge.pending;
                                    const vendor = booking.listing?.vendor;
                                    return (
                                        <div
                                            key={booking.id}
                                            className="p-5 rounded-2xl bg-[#FAF7F0] dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 hover:border-amber-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                                        >
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-bold text-base text-stone-900 dark:text-white">
                                                        {booking.listing?.title || 'Heritage Package / Verified Stay'}
                                                    </h3>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
                                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-amber-600" /> {vendor?.business_name}</span>
                                                    <span>•</span>
                                                    <span>{vendor?.district?.name} District</span>
                                                </p>

                                                <div className="text-xs text-stone-700 dark:text-stone-300 flex items-center gap-3 pt-1">
                                                    <span>🗓️ {new Date(booking.start_date).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span className="font-bold text-amber-700 dark:text-amber-400">₹{booking.total_amount?.toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                                                {booking.custom_trip_id ? (
                                                    <Link
                                                        href={route('custom-trips.show', booking.custom_trip_id)}
                                                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                        <span>Manage Trip & Vendor</span>
                                                    </Link>
                                                ) : booking.listing_id ? (
                                                    <Link
                                                        href={`/district/${booking.listing?.district_id || 1}`}
                                                        className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                        <span>View Place Details</span>
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        href={route('custom-trips.index')}
                                                        className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                        <span>View Custom Trips</span>
                                                    </Link>
                                                )}
                                                {vendor && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openReviewModal(vendor)}
                                                        className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-stone-800 dark:text-stone-200 border border-amber-300 dark:border-stone-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        <Star className="w-3.5 h-3.5 text-amber-600" />
                                                        <span>Leave Review</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-stone-500 bg-[#FAF7F0] dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3">
                                <Calendar className="w-10 h-10 text-stone-400 mx-auto" />
                                <h4 className="font-bold text-stone-900 dark:text-white text-sm">No reservations yet</h4>
                                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                                    Pick any of the 38 districts above to book verified stays and guided heritage tours!
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('districts')}
                                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold"
                                >
                                    Explore 38 Districts
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: MY REVIEWS */}
                {activeTab === 'reviews' && (
                    <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-6 shadow-md">
                        <h2 className="font-display text-xl font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            My Submitted Vendor Reviews ({reviews.length})
                        </h2>

                        {reviews.length > 0 ? (
                            <div className="space-y-3">
                                {reviews.map((r) => (
                                    <div key={r.id} className="p-4 rounded-xl bg-[#FAF7F0] dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="font-semibold text-stone-900 dark:text-white text-xs">
                                                {r.vendor?.business_name}
                                            </span>
                                            <div className="flex items-center gap-1 text-amber-500 text-xs">
                                                {Array.from({ length: r.rating }).map((_, i) => (
                                                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-xs text-stone-600 dark:text-stone-300 italic">
                                            "{r.comment}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-stone-500 bg-[#FAF7F0] dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2">
                                <p className="text-sm text-stone-900 dark:text-white font-bold">No reviews submitted yet</p>
                                <p className="text-xs">Once you complete a trip, your verified rating will appear here.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* OFFBEAT SECRET GEMS SHOWCASE */}
                {recommendedHiddenGems.length > 0 && (
                    <div className="rounded-3xl bg-white dark:bg-stone-900 border border-purple-200 dark:border-purple-800/60 p-6 shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-display text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-600" />
                                Featured Secret Hidden Gems in Tamil Nadu
                            </h3>
                            <span className="text-xs text-purple-700 dark:text-purple-300 font-semibold">Verified Offbeat Trails</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {recommendedHiddenGems.map((gem) => (
                                <Link
                                    key={gem.id}
                                    href={`/district/${gem.district_id}?tab=gems`}
                                    className="group p-3.5 rounded-2xl bg-[#FAF7F0] dark:bg-stone-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/30 border border-stone-200 dark:border-stone-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-bold text-xs text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                                                {cleanName(gem.name)}
                                            </h4>
                                            <span className="text-[10px] text-purple-800 dark:text-purple-300 font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800">
                                                {gem.district?.name}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 mt-1">
                                            {gem.description}
                                        </p>
                                    </div>
                                    <div className="mt-3 text-[10px] text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        <span>Discover Gem</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Review Submission Modal */}
            {reviewModalVendor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-6 shadow-2xl text-stone-900 dark:text-white">
                        <button
                            type="button"
                            onClick={closeReviewModal}
                            className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 dark:hover:text-white cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-4">
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                                Rate Your Experience
                            </span>
                            <h3 className="font-display text-lg font-bold mt-0.5">
                                {reviewModalVendor.business_name}
                            </h3>
                        </div>

                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase mb-2">
                                    Rating (1 to 5 Stars)
                                </label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setData('rating', star)}
                                            className="p-1 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                                        >
                                            <Star className={`w-7 h-7 ${star <= data.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300 dark:text-stone-700'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                                    Your Feedback & Review
                                </label>
                                <textarea
                                    rows="3"
                                    value={data.comment}
                                    placeholder="How was the hospitality, timing, and local tour guidance?"
                                    onChange={(e) => setData('comment', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#FAF7F0] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:bg-white"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                            >
                                {processing ? 'Submitting...' : 'Post Verified Review'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
