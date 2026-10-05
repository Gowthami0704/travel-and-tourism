import React, { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Package,
    ShieldCheck,
    Calendar,
    Users,
    Clock,
    MapPin,
    Star,
    Check,
    X,
    Sparkles,
    ArrowRight,
    MessageSquare,
    Store,
    Layers,
    FileText,
    Image as ImageIcon,
    HelpCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

export default function PackageShow({ package: pkg = {}, referencedPlaces = {}, otherPackages = [] }) {
    const [activeTab, setActiveTab] = useState('overview'); // overview, itinerary, inclusions, departures, photos, reviews
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    const departures = pkg.package_departures || [];
    const itinerary = pkg.day_wise_itinerary || [];
    const nextDeparture = departures.find((d) => d.status === 'open' || !d.status);

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'itinerary', label: 'Day-Wise Itinerary' },
        { id: 'inclusions', label: 'Inclusions & Terms' },
        { id: 'departures', label: `Departures (${departures.length})` },
        { id: 'reviews', label: 'Traveler Reviews' },
    ];

    const toggleFaq = (index) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    return (
        <MainLayout>
            <Head title={`${pkg.title} — TN Explore Tour Packages`} />

            <div className="min-h-screen bg-[#FFFDF7] dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* BREADCRUMBS */}
                    <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                        <Link href="/" className="hover:text-amber-500">Home</Link>
                        <span>/</span>
                        <Link href={route('packages.index')} className="hover:text-amber-500">Tour Packages</Link>
                        <span>/</span>
                        <span className="text-stone-900 dark:text-white font-bold truncate max-w-xs">{pkg.title}</span>
                    </div>

                    {/* 1. TOP HERO PRESENTATION CARD */}
                    <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl">
                        <div className="grid grid-cols-1 lg:grid-cols-12">
                            {/* Left: 16:10 Cover Photo */}
                            <div className="lg:col-span-7 relative aspect-[16/10] bg-stone-100 dark:bg-stone-800 overflow-hidden">
                                <img
                                    src={pkg.image_url || 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200'}
                                    alt={pkg.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 left-4 flex items-center gap-2">
                                    <span className="px-3 py-1 rounded-full bg-stone-950/80 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                                        {pkg.duration_days || pkg.days || 3} Days / {pkg.duration_nights || Math.max(0, (pkg.duration_days || 3) - 1)} Nights
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-emerald-500 text-stone-950 text-xs font-black flex items-center gap-1 shadow-md">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Verified Partner Tour ✓
                                    </span>
                                </div>
                            </div>

                            {/* Right: Package Snapshot Info */}
                            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase">
                                            {pkg.category || 'Cultural Heritage'}
                                        </span>
                                        <span className="text-xs text-stone-500 flex items-center gap-1">
                                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                            <strong>4.9</strong> (Verified)
                                        </span>
                                    </div>

                                    <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white leading-tight">
                                        {pkg.title}
                                    </h1>

                                    {pkg.hook && (
                                        <p className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-400 leading-relaxed italic">
                                            "{pkg.hook}"
                                        </p>
                                    )}

                                    <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed">
                                        {pkg.description}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Starting From</span>
                                            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                                                ₹{pkg.price_per_person || pkg.price || 4500}
                                            </span>
                                            <span className="text-[11px] text-stone-500"> / person</span>
                                        </div>

                                        {nextDeparture && (
                                            <div className="text-right">
                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase block">Next Departure</span>
                                                <span className="text-xs font-black text-stone-900 dark:text-white font-mono">
                                                    {nextDeparture.departure_date}
                                                </span>
                                                <span className="text-[10px] text-stone-500 block">
                                                    {nextDeparture.seats_left || 6} seats left
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <Link
                                        href={route('custom-trips.create')}
                                        className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        <span>Check Availability & Book Date</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. TABBED SECTIONS NAVIGATION */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200 dark:border-stone-800">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setActiveTab(t.id)}
                                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                    activeTab === t.id
                                        ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* 3. TAB CONTENTS (Only one section open at a time) */}
                    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
                        {/* TAB 1: OVERVIEW */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-black text-stone-900 dark:text-white">
                                    Tour Package Overview & Highlights
                                </h2>

                                {pkg.highlights?.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                            Key Tour Highlights
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {pkg.highlights.map((h, i) => (
                                                <div key={i} className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 flex items-start gap-2.5 text-xs">
                                                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                                    <span className="font-medium text-stone-800 dark:text-stone-200">{h}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                                        Detailed Experience
                                    </h3>
                                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-line">
                                        {pkg.description}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: DAY-WISE ITINERARY */}
                        {activeTab === 'itinerary' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-black text-stone-900 dark:text-white">
                                    Day-Wise Itinerary & Place Stops
                                </h2>

                                {itinerary.length > 0 ? (
                                    <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-amber-400/40">
                                        {itinerary.map((day, idx) => {
                                            const place = referencedPlaces[day.place_id];
                                            return (
                                                <div key={idx} className="relative pl-10 space-y-2">
                                                    <div className="absolute left-2.5 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-white dark:ring-stone-900" />
                                                    <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-2">
                                                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300">
                                                            Day {day.day_number || idx + 1}: {day.title || `Day ${idx + 1}`}
                                                        </span>
                                                        <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                                                            {day.title}
                                                        </h4>
                                                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                                                            {day.details || day.description}
                                                        </p>

                                                        {place && (
                                                            <div className="pt-2 flex items-center gap-2">
                                                                <Link
                                                                    href={route('district.show', { id: place.district_id })}
                                                                    className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-1"
                                                                >
                                                                    <MapPin className="w-3.5 h-3.5" />
                                                                    <span>Stop: {place.name} (View Guide)</span>
                                                                </Link>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 text-xs text-stone-500">
                                        Custom flex itinerary coordinated directly with verified local guide.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 3: INCLUSIONS & EXCLUSIONS */}
                        {activeTab === 'inclusions' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-black text-stone-900 dark:text-white">
                                    Inclusions, Exclusions & Policies
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Inclusions */}
                                    <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-3">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                                            <Check className="w-4 h-4 text-emerald-500" />
                                            <span>What's Included</span>
                                        </h3>
                                        <ul className="space-y-2 text-xs text-emerald-950 dark:text-emerald-200">
                                            {(pkg.inclusions || ['AC Transport between spots', 'Experienced certified local guide', 'Breakfast & traditional snacks', 'All parking & toll taxes included']).map((inc, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="text-emerald-500 font-bold">✓</span>
                                                    <span>{inc}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Exclusions */}
                                    <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-3">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                                            <X className="w-4 h-4 text-rose-500" />
                                            <span>What's Not Included</span>
                                        </h3>
                                        <ul className="space-y-2 text-xs text-rose-950 dark:text-rose-200">
                                            {(pkg.exclusions || ['Personal expenses & camera fees', 'Lunch & dinners not specified in itinerary', 'Optional entry tickets outside program']).map((exc, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="text-rose-500 font-bold">✕</span>
                                                    <span>{exc}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: DEPARTURES */}
                        {activeTab === 'departures' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-black text-stone-900 dark:text-white">
                                    Fixed Group Departure Dates & Seat Availability
                                </h2>

                                {departures.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {departures.map((dep) => (
                                            <div
                                                key={dep.id}
                                                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-2"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-stone-900 dark:text-white font-mono flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                                        {dep.departure_date}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                        {dep.seats_left} seats left
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-700 text-xs font-mono">
                                                    <span className="text-stone-500">Tariff:</span>
                                                    <strong className="text-amber-600 dark:text-amber-400">
                                                        ₹{dep.price || pkg.price_per_person}/person
                                                    </strong>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800 text-xs text-stone-500">
                                        Custom dates available on request directly through partner chat.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 5: REVIEWS */}
                        {activeTab === 'reviews' && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-black text-stone-900 dark:text-white">
                                    Traveler Reviews & Aspect Ratings
                                </h2>
                                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 text-xs text-stone-600 dark:text-stone-300 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex text-amber-400">★★★★★</div>
                                        <strong>"Unforgettable heritage walk!"</strong>
                                    </div>
                                    <p className="leading-relaxed text-stone-500">
                                        "Sundaram sir took us through hidden corridors in Madurai that we would never have found on our own. Outstanding knowledge of local history and the food tasting was amazing!"
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
