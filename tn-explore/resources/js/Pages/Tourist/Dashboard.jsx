import React, { useState, useMemo } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
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
    bookings = [],
    reviews = [],
    districts = [],
    regions = ['All', 'North', 'South', 'Kongu', 'Central', 'Coastal'],
    recommendedHiddenGems = [],
    stats = {}
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [activeTab, setActiveTab] = useState('districts'); // 'districts' | 'bookings' | 'reviews'
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
        post(route('tourist.reviews.store'), {
            onSuccess: () => closeReviewModal(),
        });
    };

    const statusBadge = {
        pending: { label: 'Awaiting Vendor Confirmation', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
        accepted: { label: 'Confirmed & Accepted', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
        rejected: { label: 'Declined by Vendor', color: 'bg-red-500/20 text-red-300 border-red-500/40' },
        completed: { label: 'Trip Completed', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    };

    return (
        <MainLayout>
            <Head title="User Dashboard — Explore All 38 Districts | TN Explore" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* HERO WELCOME BANNER */}
                <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0B1220] via-[#0E1A30] to-[#0A0F1E] border border-gold/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-1.5 text-emerald-300">
                                <Sparkles className="w-3 h-3 text-gold" />
                                Tourist & Explorer Role Active
                            </span>
                        </div>
                        <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white">
                            Vanakkam, <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-white to-gold">{user?.name || 'Explorer'}</span>!
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl leading-relaxed">
                            Explore all <strong className="text-gold">38 Districts</strong> of Tamil Nadu, smart itinerary planning, authentic food trails, verified homestays, and live reservation tracking.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-wrap items-center gap-3">
                        <Link
                            href="/"
                            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-gold via-amber-300 to-gold text-[#0A0E1A] font-bold text-xs shadow-lg shadow-gold/25 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Compass className="w-4 h-4" />
                            <span>Frontpage Explorer</span>
                        </Link>
                    </div>
                </div>

                {/* 4 LIVE STATS COUNTERS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#0C1222]/90 border border-white/10 hover:border-gold/30 transition-all">
                        <span className="text-[11px] text-gold font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            Districts Loaded
                        </span>
                        <div className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
                            {districts.length} / 38
                        </div>
                        <span className="text-[10px] text-gray-400">100% Tamil Nadu Coverage</span>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-[#0C1222]/90 border border-white/10 hover:border-emerald-500/30 transition-all">
                        <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            Active Trips
                        </span>
                        <div className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
                            {stats.activeBookings || 0}
                        </div>
                        <span className="text-[10px] text-gray-400">Confirmed Reservations</span>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-[#0C1222]/90 border border-white/10 hover:border-cyan-500/30 transition-all">
                        <span className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed
                        </span>
                        <div className="font-display text-2xl sm:text-3xl font-extrabold text-cyan-400 mt-1">
                            {stats.completedBookings || 0}
                        </div>
                        <span className="text-[10px] text-gray-400">Past Heritage Tours</span>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-[#0C1222]/90 border border-white/10 hover:border-amber-500/30 transition-all">
                        <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5" />
                            My Reviews
                        </span>
                        <div className="font-display text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1">
                            {stats.totalReviews || 0}
                        </div>
                        <span className="text-[10px] text-gray-400">Verified Feedback</span>
                    </div>
                </div>

                {/* NAVIGATION TABS (All 38 Districts / My Bookings / My Reviews) */}
                <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('districts')}
                        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                            activeTab === 'districts'
                                ? 'bg-gold text-[#0A0E1A] shadow-md shadow-gold/20'
                                : 'bg-[#0E1526] text-gray-400 hover:text-white border border-white/5'
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
                                ? 'bg-gold text-[#0A0E1A] shadow-md shadow-gold/20'
                                : 'bg-[#0E1526] text-gray-400 hover:text-white border border-white/5'
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
                                ? 'bg-gold text-[#0A0E1A] shadow-md shadow-gold/20'
                                : 'bg-[#0E1526] text-gray-400 hover:text-white border border-white/5'
                        }`}
                    >
                        <Star className="w-4 h-4" />
                        <span>My Reviews ({reviews.length})</span>
                    </button>
                </div>

                {/* TAB 1: ALL 38 DISTRICTS EXPLORER */}
                {activeTab === 'districts' && (
                    <div className="space-y-6">
                        {/* SEARCH & REGION CONTROLS */}
                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0D1424] border border-white/10">
                            {/* Search Input */}
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search any of the 38 districts (e.g. Madurai, Nilgiris, Thanjavur, Chennai)..."
                                    className="w-full pl-10 pr-4 py-2 bg-[#070B14] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
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
                                                ? 'bg-gold/20 text-gold border border-gold/40'
                                                : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
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
                                        className="group relative rounded-2xl bg-[#0E1526]/90 border border-white/10 hover:border-gold/50 shadow-xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-gold/10"
                                    >
                                        {/* Image Box */}
                                        <div className="relative h-44 w-full overflow-hidden bg-navy-lighter">
                                            <img
                                                src={img}
                                                alt={d.name}
                                                onError={(e) => handleImageError(e, 'heritage')}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0E1526] via-transparent to-black/30" />

                                            {/* Region Badge */}
                                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                                                {d.region} TN
                                            </span>

                                            {/* Hidden Gem Count Pill */}
                                            {d.hidden_gems_count > 0 && (
                                                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-purple-950/80 backdrop-blur-md border border-purple-400/40 text-[10px] font-bold text-purple-300 flex items-center gap-1">
                                                    <Sparkles className="w-2.5 h-2.5" />
                                                    {d.hidden_gems_count} Gems
                                                </span>
                                            )}
                                        </div>

                                        {/* Content Box */}
                                        <div className="p-4 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-display font-bold text-base text-white group-hover:text-gold transition-colors">
                                                    {cleanName(d.name)}
                                                </h3>
                                                <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                                    {d.description || 'Explore rich temples, heritage sites, waterfalls, and local food.'}
                                                </p>
                                            </div>

                                            {/* Counts Strip */}
                                            <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-300">
                                                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                                                    <MapPin className="w-3 h-3" />
                                                    {d.places_count || 0} Places
                                                </span>
                                                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                                                    <Utensils className="w-3 h-3" />
                                                    {d.food_dishes_count || 0} Foods
                                                </span>
                                                <span className="flex items-center gap-1 text-cyan-400 font-semibold">
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
                            <div className="p-10 text-center rounded-2xl bg-[#0D1424] border border-white/10 text-gray-400 space-y-2">
                                <p className="text-sm font-bold text-white">No districts matched "{searchQuery}"</p>
                                <p className="text-xs">Try searching for Chennai, Madurai, Nilgiris, Thanjavur, or Coimbatore.</p>
                                <button
                                    type="button"
                                    onClick={() => { setSearchQuery(''); setSelectedRegion('All'); }}
                                    className="mt-2 px-3 py-1.5 rounded-lg bg-gold text-black text-xs font-bold"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: MY BOOKINGS */}
                {activeTab === 'bookings' && (
                    <div className="rounded-3xl bg-[#0C1222] border border-white/10 p-6 shadow-xl">
                        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                            <div>
                                <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-gold" />
                                    My Tour & Stay Reservations
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
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
                                            className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-gold/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                        >
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-bold text-base text-white">
                                                        {booking.listing?.title || 'Heritage Package / Verified Stay'}
                                                    </h3>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-gray-400 flex items-center gap-2">
                                                    <span>📍 {vendor?.business_name}</span>
                                                    <span>•</span>
                                                    <span>{vendor?.district?.name} District</span>
                                                </p>

                                                <div className="text-xs text-gray-300 flex items-center gap-3 pt-1">
                                                    <span>🗓️ {new Date(booking.start_date).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span className="font-bold text-gold">₹{booking.total_amount?.toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 self-start sm:self-center">
                                                {vendor && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openReviewModal(vendor)}
                                                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-gold hover:text-black text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        <Star className="w-3.5 h-3.5 text-gold" />
                                                        <span>Leave Review</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-400 bg-white/[0.02] rounded-2xl border border-white/5 space-y-3">
                                <Calendar className="w-10 h-10 text-gray-500 mx-auto" />
                                <h4 className="font-bold text-white text-sm">No reservations yet</h4>
                                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                                    Pick any of the 38 districts above to book verified stays and guided heritage tours!
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('districts')}
                                    className="px-4 py-2 rounded-xl bg-gold text-black text-xs font-bold"
                                >
                                    Explore 38 Districts
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: MY REVIEWS */}
                {activeTab === 'reviews' && (
                    <div className="rounded-3xl bg-[#0C1222] border border-white/10 p-6 shadow-xl">
                        <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-gold" />
                            My Submitted Vendor Reviews ({reviews.length})
                        </h2>

                        {reviews.length > 0 ? (
                            <div className="space-y-3">
                                {reviews.map((r) => (
                                    <div key={r.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="font-semibold text-white text-xs">
                                                {r.vendor?.business_name}
                                            </span>
                                            <div className="flex items-center gap-1 text-gold text-xs">
                                                {Array.from({ length: r.rating }).map((_, i) => (
                                                    <Star key={i} className="w-3.5 h-3.5 fill-gold" />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-300 italic">
                                            "{r.comment}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-400 bg-white/[0.02] rounded-2xl border border-white/5 space-y-2">
                                <p className="text-sm text-white font-bold">No reviews submitted yet</p>
                                <p className="text-xs">Once you complete a trip, your verified rating will appear here.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* OFFBEAT SECRET GEMS SHOWCASE */}
                {recommendedHiddenGems.length > 0 && (
                    <div className="rounded-3xl bg-gradient-to-br from-purple-950/30 via-[#0C1222] to-[#0A0F1E] border border-purple-500/30 p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-gold" />
                                Featured Secret Hidden Gems in Tamil Nadu
                            </h3>
                            <span className="text-xs text-purple-300 font-semibold">Verified Offbeat Trails</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {recommendedHiddenGems.map((gem) => (
                                <Link
                                    key={gem.id}
                                    href={`/district/${gem.district_id}?tab=gems`}
                                    className="group p-3.5 rounded-2xl bg-white/[0.03] hover:bg-purple-900/20 border border-white/5 hover:border-purple-500/40 transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-bold text-xs text-white group-hover:text-gold transition-colors">
                                                {cleanName(gem.name)}
                                            </h4>
                                            <span className="text-[10px] text-purple-300 font-semibold px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-400/30">
                                                {gem.district?.name}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 line-clamp-2 mt-1">
                                            {gem.description}
                                        </p>
                                    </div>
                                    <div className="mt-3 text-[10px] text-gold font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="relative w-full max-w-md rounded-2xl bg-[#0D1322] border border-white/20 p-6 shadow-2xl text-white">
                        <button
                            type="button"
                            onClick={closeReviewModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-4">
                            <span className="text-xs font-bold text-gold uppercase tracking-wider">
                                Rate Your Experience
                            </span>
                            <h3 className="font-display text-lg font-bold mt-0.5">
                                {reviewModalVendor.business_name}
                            </h3>
                        </div>

                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                                    Rating (1 to 5 Stars)
                                </label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setData('rating', star)}
                                            className="p-1 text-gold hover:scale-125 transition-transform cursor-pointer"
                                        >
                                            <Star className={`w-7 h-7 ${star <= data.rating ? 'fill-gold text-gold' : 'text-gray-600'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                                    Your Feedback & Review
                                </label>
                                <textarea
                                    rows="3"
                                    value={data.comment}
                                    placeholder="How was the hospitality, timing, and local tour guidance?"
                                    onChange={(e) => setData('comment', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#080C16] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-gold"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-2.5 rounded-xl bg-gold text-black font-bold text-xs shadow-md hover:bg-gold-light transition-all cursor-pointer"
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
