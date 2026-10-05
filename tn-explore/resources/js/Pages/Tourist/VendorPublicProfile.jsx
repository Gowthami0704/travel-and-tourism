import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import BookingModal from '@/Components/Vendor/BookingModal';
import ReviewList from '@/Components/Reviews/ReviewList';
import ReviewFormModal from '@/Components/Reviews/ReviewFormModal';
import Card from '@/Components/UI/Card';
import StatusChip from '@/Components/UI/StatusChip';
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
    Globe,
    Users,
    Info,
    Eye,
    Bike,
    Clock,
    DollarSign,
    Check,
    X,
    AlertTriangle,
    Flag,
    ArrowLeft,
    ChevronRight,
    Lock
} from 'lucide-react';

export default function VendorPublicProfile({
    vendor,
    trustTier = { tier: 'verified', label: 'Verified Partner ✓', badge: 'bg-[var(--verified)]/15 text-[var(--verified)] border-[var(--verified)]/30' },
    hasConfirmedBooking = false,
    activityMetrics = {},
    priceFairness = {},
    checklist = [],
    listings = [],
    groupedListings = {},
    reviews = [],
    canReview = false,
    districts = []
}) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedListing, setSelectedListing] = useState(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const { data: reportData, setData: setReportData, post: postReport, processing: reportProcessing, reset: resetReport } = useForm({
        category: 'overcharging',
        reason: '',
    });

    const handleOpenBooking = (listing) => {
        setSelectedListing(listing);
        setIsBookingOpen(true);
    };

    const handleReportSubmit = (e) => {
        e.preventDefault();
        postReport(route('vendor.report', vendor.slug || vendor.id), {
            onSuccess: () => {
                setIsReportModalOpen(false);
                resetReport();
            }
        });
    };

    const filterTabs = [
        { id: 'all', label: 'All Services', count: listings.length },
        { id: 'package', label: 'Tour Packages', icon: Package, count: groupedListings.package?.length || 0 },
        { id: 'car', label: 'Car & Cabs', icon: Car, count: groupedListings.car?.length || 0 },
        { id: 'bus', label: 'Bus Rentals', icon: Bus, count: groupedListings.bus?.length || 0 },
        { id: 'bike', label: 'Bike Rentals', icon: Bike, count: groupedListings.bike?.length || 0 },
        { id: 'guide', label: 'Tour Guides', icon: Compass, count: groupedListings.guide?.length || 0 },
        { id: 'hotel', label: 'Homestays & Rooms', icon: Hotel, count: groupedListings.hotel?.length || 0 },
    ].filter(t => t.id === 'all' || t.count > 0);

    const displayedListings = activeFilter === 'all' ? listings : (groupedListings[activeFilter] || []);

    return (
        <MainLayout>
            <Head>
                <title>{`${vendor.business_name} — ${trustTier.label} | TN Explore`}</title>
                <meta name="description" content={`Book verified transport, tour guides and holiday circuits directly from ${vendor.business_name} in ${vendor.district?.name || 'Tamil Nadu'}.`} />
            </Head>

            <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* TOP BREADCRUMB & BACK NAVIGATION BAR */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
                        <button
                            type="button"
                            onClick={() => {
                                if (window.history.length > 1) {
                                    window.history.back();
                                } else if (vendor.district?.id) {
                                    window.location.href = route('district.show', vendor.district.id);
                                } else {
                                    window.location.href = '/';
                                }
                            }}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--card)] hover:bg-[var(--border)]/40 border border-[var(--border)] text-xs sm:text-sm font-semibold text-[var(--text)] transition-all shadow-sm hover:scale-[1.02] cursor-pointer group"
                            title="Go back to previous page"
                        >
                            <ArrowLeft className="w-4 h-4 text-[var(--primary)] transition-transform group-hover:-translate-x-1" />
                            <span>Back {vendor.district?.name ? `to ${vendor.district.name}` : ''}</span>
                        </button>

                        <nav className="flex items-center gap-1.5 text-xs text-[var(--muted)] overflow-x-auto py-1">
                            <Link href="/" className="hover:text-[var(--text)] transition-colors flex items-center gap-1">
                                Home
                            </Link>
                            <ChevronRight className="w-3 h-3 text-[var(--muted)] flex-shrink-0" />
                            {vendor.district ? (
                                <>
                                    <Link href={route('district.show', vendor.district.id)} className="hover:text-[var(--text)] transition-colors whitespace-nowrap">
                                        {vendor.district.name} District
                                    </Link>
                                    <ChevronRight className="w-3 h-3 text-[var(--muted)] flex-shrink-0" />
                                </>
                            ) : null}
                            <span className="text-[var(--text)] font-semibold truncate max-w-[180px] sm:max-w-xs">{vendor.business_name}</span>
                        </nav>
                    </div>

                    {/* VENDOR PROFILE HERO HEADER */}
                    <div className="relative rounded-3xl overflow-hidden bg-[var(--card)] border border-[var(--border)] shadow-md p-6 sm:p-8 transition-colors">
                        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] text-3xl font-black shadow-sm flex-shrink-0">
                                    {vendor.logo_url ? (
                                        <img src={vendor.logo_url} alt={vendor.business_name} className="w-full h-full object-cover rounded-2xl" />
                                    ) : (
                                        <Store className="w-8 h-8 text-[var(--primary)]" />
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${trustTier.badge}`}>
                                            <ShieldCheck className="w-4 h-4" />
                                            {trustTier.label}
                                        </span>

                                        <span className="text-xs text-[var(--muted)] flex items-center gap-1 font-medium">
                                            <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" />
                                            {vendor.district?.name || 'Tamil Nadu'}, Tamil Nadu
                                        </span>
                                    </div>

                                    <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[var(--text)] tracking-tight">
                                        {vendor.business_name}
                                    </h1>

                                    <p className="text-xs sm:text-sm text-[var(--muted)] line-clamp-2 max-w-3xl leading-relaxed">
                                        {vendor.description || 'Verified local tourism & fleet provider across Tamil Nadu.'}
                                    </p>
                                </div>
                            </div>

                            {/* Contact & Report Actions */}
                            <div className="flex flex-wrap md:flex-col items-center gap-2.5 w-full md:w-auto">
                                {hasConfirmedBooking ? (
                                    <a
                                        href={`https://wa.me/${vendor.phone ? vendor.phone.replace(/[^0-9]/g, '') : ''}?text=Hi%20${encodeURIComponent(vendor.business_name)},%20I%20have%20a%20confirmed%20booking%20with%20you%20on%20TN%20Explore`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md hover:scale-105 transition-all flex items-center gap-2 flex-1 md:flex-none justify-center cursor-pointer"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        <span>Direct WhatsApp</span>
                                    </a>
                                ) : (
                                    <div
                                        className="px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)] text-xs font-semibold flex items-center gap-2 flex-1 md:flex-none justify-center cursor-not-allowed"
                                        title="Direct WhatsApp contact is unlocked after a trip booking is confirmed."
                                    >
                                        <Lock className="w-3.5 h-3.5 text-[var(--muted)]" />
                                        <span>WhatsApp (After Booking)</span>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setIsReportModalOpen(true)}
                                    className="px-3 py-2 rounded-xl bg-[var(--bg)] hover:bg-rose-500/10 border border-[var(--border)] hover:border-rose-500/30 text-[var(--muted)] hover:text-rose-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <Flag className="w-3.5 h-3.5" />
                                    <span>Report Concern</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* TRUST ARCHITECTURE & REAL ACTIVITY STATS */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 1. Verified Checklist */}
                        <Card className="space-y-4">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-[var(--verified)]" />
                                <h3 className="text-base font-bold text-[var(--text)]">Trust & Verification Checks</h3>
                            </div>

                            <div className="space-y-3">
                                {checklist.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                            item.verified ? 'bg-[var(--verified)]/15 text-[var(--verified)]' : 'bg-[var(--border)] text-[var(--muted)]'
                                        }`}>
                                            {item.verified ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Clock className="w-3 h-3" />}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-[var(--text)]">{item.title}</div>
                                            <div className="text-[11px] text-[var(--muted)]">{item.detail}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* 2. Operational Metrics & Price Fairness */}
                        <Card className="space-y-4">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-[var(--primary)]" />
                                <h3 className="text-base font-bold text-[var(--text)]">Fair Pricing & Operations</h3>
                            </div>

                            {/* Price Fairness */}
                            <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1.5">
                                <div className="text-xs font-bold text-[var(--text)] flex items-center justify-between">
                                    <span>Regional Price Fairness</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold">
                                        Verified Baseline
                                    </span>
                                </div>
                                <div className="text-xs font-semibold text-[var(--text)]">
                                    {priceFairness.label}
                                </div>
                                <div className="text-[10px] text-[var(--muted)]">
                                    District Baseline: ₹{priceFairness.district_avg}/day • Partner Avg: ₹{priceFairness.vendor_avg}/day
                                </div>
                            </div>

                            {/* Activity numbers */}
                            <div className="grid grid-cols-2 gap-2 text-center">
                                <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                                    <div className="text-lg font-black text-[var(--text)]">{activityMetrics.completed_bookings || 0}</div>
                                    <div className="text-[10px] text-[var(--muted)] uppercase font-semibold">Completed Bookings</div>
                                </div>
                                <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                                    <div className="text-lg font-black text-[var(--text)]">{activityMetrics.cancellation_rate_pct}%</div>
                                    <div className="text-[10px] text-[var(--muted)] uppercase font-semibold">Cancellation Rate</div>
                                </div>
                            </div>
                        </Card>

                        {/* 3. Operational Policies */}
                        <Card className="flex flex-col justify-between space-y-4">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock className="w-5 h-5 text-[var(--primary)]" />
                                    <h3 className="text-base font-bold text-[var(--text)]">Traveler Protection & Policies</h3>
                                </div>

                                <div className="space-y-2.5 text-xs text-[var(--text)]">
                                    <div className="flex items-center justify-between py-1.5 border-b border-[var(--border)]">
                                        <span className="text-[var(--muted)]">Cancellation Rule:</span>
                                        <span className="font-semibold text-[var(--verified)]">
                                            {activityMetrics.cancellation_policy === 'free_24h' ? 'Free up to 24 hours' : activityMetrics.cancellation_policy}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-1.5 border-b border-[var(--border)]">
                                        <span className="text-[var(--muted)]">Avg Response Time:</span>
                                        <span className="font-semibold text-[var(--text)]">Under 15 Minutes</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1.5 border-b border-[var(--border)]">
                                        <span className="text-[var(--muted)]">Operating Experience:</span>
                                        <span className="font-semibold text-[var(--text)]">{activityMetrics.operating_years || 2} Years Active</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[11px] text-[var(--muted)] flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-[var(--primary)] shrink-0" />
                                <span>Zero middleman commission: 100% of your payment supports local Tamil Nadu operators.</span>
                            </div>
                        </Card>
                    </div>

                    {/* FILTER TABS & SERVICE LISTINGS */}
                    <div className="space-y-6 pt-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-serif font-bold text-[var(--text)]">Available Services & Fleet</h2>
                                <p className="text-xs text-[var(--muted)]">Browse transparent rates and reserve directly with instant confirmation.</p>
                            </div>

                            {filterTabs.length > 1 && (
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                                    {filterTabs.map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => setActiveFilter(tab.id)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                                                    activeFilter === tab.id
                                                        ? 'bg-[var(--primary)] text-[var(--primary-text)] shadow-sm'
                                                        : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
                                                }`}
                                            >
                                                {Icon && <Icon className="w-3.5 h-3.5" />}
                                                <span>{tab.label}</span>
                                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeFilter === tab.id ? 'bg-black/20 text-inherit font-bold' : 'bg-[var(--border)] text-[var(--muted)]'}`}>
                                                    {tab.count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {displayedListings.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayedListings.map((listing) => (
                                    <div
                                        key={listing.id}
                                        className="rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--muted)] shadow-sm overflow-hidden flex flex-col justify-between group transition-all duration-200 hover:-translate-y-0.5"
                                    >
                                        <div className="relative h-48 w-full overflow-hidden bg-[var(--bg)]">
                                            {listing.image_url ? (
                                                <img
                                                    src={listing.image_url}
                                                    alt={listing.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--bg)] text-center p-4">
                                                    <Package className="w-8 h-8 text-[var(--primary)] mb-1.5" />
                                                    <span className="text-xs font-bold text-[var(--text)]">{listing.title}</span>
                                                </div>
                                            )}

                                            <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[var(--card)]/90 backdrop-blur-md border border-[var(--border)] text-[10px] font-bold text-[var(--text)] uppercase tracking-wider">
                                                {listing.type?.replace('_', ' ')}
                                            </div>
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-serif text-lg font-bold text-[var(--text)] mb-1.5 line-clamp-1">
                                                    {listing.title}
                                                </h3>
                                                <p className="text-xs text-[var(--muted)] line-clamp-3 leading-relaxed mb-4">
                                                    {listing.description || 'Direct tourist service across Tamil Nadu.'}
                                                </p>
                                            </div>

                                            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-3">
                                                <div>
                                                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold block">Fixed Rate</span>
                                                    <div className="text-lg font-serif font-black text-[var(--text)]">
                                                        ₹{listing.price?.toLocaleString('en-IN') || 0}
                                                        <span className="text-[10px] font-normal text-[var(--muted)] ml-1">/ {listing.pricing_unit || 'day'}</span>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenBooking(listing)}
                                                    className="px-4 py-2 rounded-xl bg-[var(--primary)] hover:opacity-90 text-[var(--primary-text)] font-bold text-xs shadow-sm hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    <span>Book Direct</span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-[var(--muted)] bg-[var(--card)] rounded-2xl border border-[var(--border)]">
                                No active listings published in this category yet.
                            </div>
                        )}
                    </div>

                    {/* VERIFIED REVIEWS SECTION */}
                    <div className="space-y-4 pt-6 border-t border-[var(--border)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-serif font-bold text-[var(--text)]">Tourist Feedback & Ratings</h2>
                                <p className="text-xs text-[var(--muted)]">Authentic post-trip experiences from verified travelers.</p>
                            </div>

                            {canReview && (
                                <button
                                    type="button"
                                    onClick={() => setIsReviewModalOpen(true)}
                                    className="px-3.5 py-2 rounded-xl bg-[var(--card)] hover:bg-[var(--border)] border border-[var(--border)] text-xs font-bold text-[var(--text)] transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Star className="w-4 h-4 text-amber-500" />
                                    <span>Leave a Review</span>
                                </button>
                            )}
                        </div>

                        <ReviewList reviews={reviews} vendorId={vendor.id} />
                    </div>

                </div>
            </div>

            {/* DIRECT BOOKING MODAL */}
            {isBookingOpen && selectedListing && (
                <BookingModal
                    isOpen={isBookingOpen}
                    onClose={() => {
                        setIsBookingOpen(false);
                        setSelectedListing(null);
                    }}
                    listing={selectedListing}
                    vendor={vendor}
                />
            )}

            {/* REVIEW FORM MODAL */}
            {isReviewModalOpen && (
                <ReviewFormModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    vendorId={vendor.id}
                />
            )}

            {/* TOURIST REPORT SAFETY MODAL */}
            {isReportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="w-full max-w-md rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 shadow-2xl space-y-4 text-[var(--text)]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-rose-600">
                                <AlertTriangle className="w-5 h-5" />
                                <h3 className="font-bold text-base text-[var(--text)]">Report Safety / Service Issue</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsReportModalOpen(false)}
                                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--text)]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-xs text-[var(--muted)]">
                            Your report directly alerts TN Explore administrators and flags the partner in the anomaly inspection queue.
                        </p>

                        <form onSubmit={handleReportSubmit} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Issue Category</label>
                                <select
                                    value={reportData.category}
                                    onChange={(e) => setReportData('category', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-xs focus:border-rose-400"
                                >
                                    <option value="overcharging">Overcharging beyond declared rate</option>
                                    <option value="misleading_info">Misleading vehicle/room photos or specs</option>
                                    <option value="unresponsive">Unresponsive / No-show after booking</option>
                                    <option value="fake_license">Suspected invalid license / documents</option>
                                    <option value="cancellation_issue">Refusal to process refund</option>
                                    <option value="other">Other safety concern</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Detailed Explanation</label>
                                <textarea
                                    rows="4"
                                    value={reportData.reason}
                                    onChange={(e) => setReportData('reason', e.target.value)}
                                    placeholder="Please describe what occurred and include booking/date details..."
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-xs focus:border-rose-400"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsReportModalOpen(false)}
                                    className="px-3 py-2 rounded-xl bg-[var(--bg)] text-[var(--muted)] text-xs font-semibold hover:bg-[var(--border)]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={reportProcessing || !reportData.reason}
                                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md disabled:opacity-50"
                                >
                                    {reportProcessing ? 'Submitting...' : 'Submit Report to Admin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
