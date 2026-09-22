import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import BookingModal from '@/Components/Vendor/BookingModal';
import ReviewList from '@/Components/Reviews/ReviewList';
import ReviewFormModal from '@/Components/Reviews/ReviewFormModal';
import {
    Store,
    ShieldCheck,
    ShieldAlert,
    MapPin,
    Phone,
    Mail,
    Star,
    Bus,
    Car,
    Compass,
    Package,
    Hotel,
    Utensils,
    Calendar,
    CheckCircle2,
    Sparkles,
    MessageCircle,
    ArrowRight,
    Users,
    Info,
    Eye
} from 'lucide-react';

export default function VendorPublicProfile({ vendor, listings = [], groupedListings = {}, reviews = [], canReview = false, districts = [] }) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedListing, setSelectedListing] = useState(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const isVerified = vendor?.kyc_status === 'verified' || vendor?.status === 'active';
    const aiDetails = vendor?.ai_trust_breakdown || {
        percent: Math.round((vendor?.trust_score || 0.85) * 100),
        avg_rating: 4.8,
        total_reviews: reviews.length
    };

    const handleOpenBooking = (listing) => {
        setSelectedListing(listing);
        setIsBookingOpen(true);
    };

    const filterTabs = [
        { id: 'all', label: 'All Services', count: listings.length },
        { id: 'bus', label: 'Bus Rentals', icon: Bus, count: groupedListings.bus?.length || 0 },
        { id: 'car', label: 'Car & Cabs', icon: Car, count: groupedListings.car?.length || 0 },
        { id: 'guide', label: 'Tour Guides', icon: Compass, count: groupedListings.guide?.length || 0 },
        { id: 'package', label: 'Tour Packages', icon: Package, count: groupedListings.package?.length || 0 },
        { id: 'hotel', label: 'Homestays & Rooms', icon: Hotel, count: groupedListings.hotel?.length || 0 },
    ].filter(t => t.id === 'all' || t.count > 0);

    const displayedListings = activeFilter === 'all' ? listings : (groupedListings[activeFilter] || []);

    return (
        <MainLayout>
            <Head>
                <title>{`${vendor.business_name} — Verified Travel Partner | TN Explore`}</title>
                <meta name="description" content={`Book verified transport, tour guides and holiday circuits directly from ${vendor.business_name} in ${vendor.district?.name || 'Tamil Nadu'}. ${vendor.description?.substring(0, 150)}`} />
                <meta property="og:title" content={`${vendor.business_name} — TN Explore`} />
                <meta property="og:description" content={vendor.description?.substring(0, 200)} />
                <meta property="og:type" content="business.business" />
            </Head>

            <div className="min-h-screen bg-[#070B14] text-white py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* VENDOR PROFILE HERO HEADER */}
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0E172A] via-[#101F38] to-[#0E172A] border border-white/10 shadow-2xl p-6 sm:p-8">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border border-white/15 flex items-center justify-center text-emerald-400 text-3xl font-black shadow-xl flex-shrink-0">
                                    {vendor.logo_url ? (
                                        <img src={vendor.logo_url} alt={vendor.business_name} className="w-full h-full object-cover rounded-2xl" />
                                    ) : (
                                        <Store className="w-9 h-9 text-gold" />
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {isVerified ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                                VERIFIED TN TOURISM PARTNER
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                                <ShieldAlert className="w-4 h-4 text-amber-400" />
                                                UNVERIFIED VENDOR (KYC PENDING)
                                            </span>
                                        )}

                                        <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                                            {vendor.specialties ? vendor.specialties.join(', ').replace(/_/g, ' ') : 'Tour Operator'}
                                        </span>
                                    </div>

                                    <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                                        {vendor.business_name}
                                    </h1>

                                    <p className="text-xs sm:text-sm text-gray-300 flex flex-wrap items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gold" />
                                        <span>{vendor.district?.name || 'Tamil Nadu'}, Tamil Nadu</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1 text-gold font-semibold">
                                            <Star className="w-4 h-4 fill-gold text-gold" />
                                            {aiDetails.avg_rating} ({aiDetails.total_reviews} reviews)
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Trust Badge & Quick Contact */}
                            <div className="flex flex-col sm:flex-row md:flex-col items-end gap-3 w-full md:w-auto">
                                <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 shadow-lg flex items-center gap-3 w-full sm:w-auto">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                                        isVerified ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    }`}>
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-gray-400">AI Trust Score</div>
                                        <div className="text-lg font-black text-white">{aiDetails.percent}%</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <a
                                        href={`https://wa.me/91${vendor.phone?.replace(/[^0-9]/g, '') || '9840156789'}?text=Hi%20${encodeURIComponent(vendor.business_name)},%20I%20found%20your%20services%20on%20TN%20Explore`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        <span>WhatsApp</span>
                                    </a>

                                    <a
                                        href={`tel:${vendor.phone || '+919842111223'}`}
                                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <Phone className="w-4 h-4 text-gold" />
                                        <span>Call Vendor</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {vendor.description && (
                            <div className="mt-5 pt-4 border-t border-white/10 text-xs sm:text-sm text-gray-300 leading-relaxed max-w-4xl">
                                {vendor.description}
                            </div>
                        )}
                    </div>

                    {/* SPECIALTY FILTER TABS */}
                    <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
                        {filterTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isSelected = activeFilter === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveFilter(tab.id)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                        isSelected
                                            ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                                            : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    {Icon && <Icon className="w-4 h-4" />}
                                    <span>{tab.label}</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950/30 text-slate-950' : 'bg-white/10 text-gray-300'}`}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* LISTINGS SHOWCASE */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-gold" />
                                <span>Available Travel Services ({displayedListings.length})</span>
                            </h2>
                        </div>

                        {displayedListings.length === 0 ? (
                            <div className="p-12 rounded-2xl bg-white/5 text-center text-gray-400 space-y-2">
                                <Package className="w-10 h-10 mx-auto text-gray-600" />
                                <p className="text-sm">No services listed under this category yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayedListings.map((listing) => (
                                    <div
                                        key={listing.id}
                                        className="rounded-2xl bg-[#0E1526] border border-white/10 hover:border-emerald-500/40 transition-all shadow-xl overflow-hidden flex flex-col group"
                                    >
                                        <div className="relative h-48 bg-slate-950 overflow-hidden">
                                            <img
                                                src={listing.image_url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600'}
                                                alt={listing.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />
                                            <div className="absolute top-3 left-3">
                                                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                                                    {listing.type}
                                                </span>
                                            </div>
                                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                                                <span className="text-xl font-extrabold text-gold font-mono">
                                                    ₹{Number(listing.price).toLocaleString('en-IN')}
                                                    <span className="text-xs text-gray-300 font-normal">
                                                        {listing.type === 'package' ? '/person' : '/day'}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                            <div>
                                                <h3 className="text-base font-bold text-white group-hover:text-gold transition-colors line-clamp-1">
                                                    {listing.title}
                                                </h3>
                                                <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                                                    {listing.description}
                                                </p>

                                                {/* Details */}
                                                {listing.details && (
                                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                                        {listing.details.bus_type && (
                                                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-300">
                                                                {listing.details.bus_type} ({listing.details.total_seats} Seats)
                                                            </span>
                                                        )}
                                                        {listing.details.car_type && (
                                                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-300">
                                                                {listing.details.car_type}
                                                            </span>
                                                        )}
                                                        {listing.details.duration_days && (
                                                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-300">
                                                                {listing.details.duration_days} Days
                                                            </span>
                                                        )}
                                                        {listing.details.languages && (
                                                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-300">
                                                                {listing.details.languages.join(', ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Book Now Button */}
                                            <button
                                                onClick={() => handleOpenBooking(listing)}
                                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                                            >
                                                <span>Book Now</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* COMPREHENSIVE REVIEWS SECTION */}
                    <div className="pt-4">
                        <ReviewList
                            reviews={reviews}
                            targetType="vendor"
                            targetId={vendor.id}
                            targetName={vendor.business_name}
                            onOpenReviewModal={() => setIsReviewModalOpen(true)}
                        />
                    </div>
                </div>
            </div>

            {/* In-App Booking Modal */}
            <BookingModal
                listing={selectedListing}
                vendor={vendor}
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
            />

            {/* Review Form Modal */}
            <ReviewFormModal
                targetType="vendor"
                targetId={vendor.id}
                targetName={vendor.business_name}
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
            />
        </MainLayout>
    );
}
