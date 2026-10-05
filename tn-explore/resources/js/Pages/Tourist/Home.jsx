import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import DistrictCard from '@/Components/District/DistrictCard';
import { useLanguage } from '@/Contexts/LanguageContext';
import { 
    Compass, Sparkles, Search, MapPin, ChevronRight, ShieldCheck, 
    Utensils, Heart, ArrowUpRight, ArrowRight, Flame, Layers, Award,
    Star, Phone, CheckCircle2, Calendar
} from 'lucide-react';

export default function Home({ districts = [], filters = {}, featuredVendors = [] }) {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Filter districts locally for instant responsiveness
    const filteredDistricts = districts.filter((d) => {
        const matchesSearch = searchTerm === '' ||
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    return (
        <MainLayout>
            <Head title="Tamil Nadu Smart Tourism — Explore 38 Districts & Verified Local Operators" />

            {/* Hero Section: Full-Width Real District Photography */}
            <div className="relative min-h-[480px] sm:min-h-[560px] md:min-h-[620px] flex items-center justify-center overflow-hidden border-b border-[#E6D5B8]">
                {/* Real Tamil Nadu Gopuram / Scenic Photo Background with Warm Filter */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1920&q=85"
                        alt="Meenakshi Temple Gopuram Tamil Nadu"
                        className="w-full h-full object-cover object-center"
                    />
                    {/* Warm Sunset & Cultural Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/95 via-[#1C1917]/70 to-[#881337]/50" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-24 space-y-4 sm:space-y-6">
                    {/* Verified Safety Badge */}
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-amber-950/70 border border-amber-400/40 text-[10px] sm:text-xs font-bold tracking-wider text-amber-200 shadow-xl backdrop-blur-md uppercase">
                        <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                        <span>{t('verified_badge_text')}</span>
                    </div>

                    {/* Headline with Rich Serif Display Typography */}
                    <h1 className="font-serif font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-white leading-[1.15] drop-shadow-lg">
                        {t('hero_title')}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xs sm:text-base md:text-lg text-amber-100/90 max-w-2xl mx-auto leading-relaxed drop-shadow">
                        {t('hero_subtitle')}
                    </p>

                    {/* Search & Quick Action Box */}
                    <div className="max-w-2xl mx-auto pt-2 space-y-3">
                        <div className="relative flex items-center rounded-2xl bg-white/95 dark:bg-stone-900/95 border border-amber-300 dark:border-amber-600/60 p-1.5 sm:p-2 shadow-2xl shadow-stone-950/40 backdrop-blur-xl focus-within:border-turmeric-500 transition-all">
                            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-turmeric-700 dark:text-amber-400 ml-2 sm:ml-3 shrink-0" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t('search_placeholder')}
                                className="w-full bg-transparent border-0 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-500 dark:placeholder-stone-400 focus:ring-0 px-2 sm:px-3 py-2 sm:py-2.5 outline-none min-w-0"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="text-xs text-stone-400 dark:text-stone-300 hover:text-stone-700 dark:hover:text-stone-100 px-1.5 cursor-pointer shrink-0"
                                >
                                    ✕
                                </button>
                            )}
                            <a
                                href="#districts-grid"
                                className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                                <span>Find</span>
                                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </a>
                        </div>

                        {/* Quick AI & Planner Pills */}
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
                            <Link
                                href="/ai-guide"
                                className="px-3.5 sm:px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-300 text-amber-100 hover:text-white hover:bg-amber-500/30 transition-all font-semibold flex items-center gap-1.5 backdrop-blur-sm text-[11px] sm:text-xs"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>{t('ask_ai_guide')}</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>

                            <Link
                                href="/trip-builder"
                                className="px-3.5 sm:px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all font-semibold flex items-center gap-1.5 backdrop-blur-sm text-[11px] sm:text-xs"
                            >
                                <Compass className="w-3.5 h-3.5 text-amber-300" />
                                <span>{t('trip_builder')}</span>
                            </Link>
                        </div>
                    </div>

                    {/* Live Stats Bar with Grounded Counts */}
                    <div className="pt-2 sm:pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-3xl mx-auto text-left">
                        <div className="p-2.5 sm:p-3.5 rounded-xl bg-stone-900/70 border border-amber-400/20 backdrop-blur-md">
                            <span className="font-serif font-black text-xl sm:text-2xl text-amber-300">38</span>
                            <p className="text-[10px] sm:text-[11px] text-stone-300 font-semibold tracking-wide">Districts of TN</p>
                        </div>
                        <div className="p-2.5 sm:p-3.5 rounded-xl bg-stone-900/70 border border-amber-400/20 backdrop-blur-md">
                            <span className="font-serif font-black text-xl sm:text-2xl text-amber-300">1,500+</span>
                            <p className="text-[10px] sm:text-[11px] text-stone-300 font-semibold tracking-wide">Temples & Sites</p>
                        </div>
                        <div className="p-2.5 sm:p-3.5 rounded-xl bg-stone-900/70 border border-amber-400/20 backdrop-blur-md">
                            <span className="font-serif font-black text-xl sm:text-2xl text-amber-300">500+</span>
                            <p className="text-[10px] sm:text-[11px] text-stone-300 font-semibold tracking-wide">Authentic Dishes</p>
                        </div>
                        <div className="p-2.5 sm:p-3.5 rounded-xl bg-stone-900/70 border border-amber-400/20 backdrop-blur-md">
                            <span className="font-serif font-black text-xl sm:text-2xl text-amber-300">KYC + AI</span>
                            <p className="text-[10px] sm:text-[11px] text-stone-300 font-semibold tracking-wide">Verified Vendors</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 38 Districts Discovery Grid */}
            <div id="districts-grid" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-maroon-800 dark:text-amber-400 mb-1">
                            <Layers className="w-3.5 h-3.5 text-turmeric-600 dark:text-amber-400" />
                            <span>District-First Marketplace</span>
                        </div>
                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100">
                            {t('explore')} ({districts.length})
                        </h2>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                            Showing {filteredDistricts.length} of {districts.length} districts with real photo galleries, seasons & attractions
                        </p>
                    </div>
                </div>

                {/* Districts Grid */}
                {filteredDistricts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDistricts.map((district) => (
                            <DistrictCard key={district.id} district={district} />
                        ))}
                    </div>
                ) : (
                    <div className="p-12 rounded-2xl bg-white dark:bg-stone-900 border border-[#E6D5B8] dark:border-stone-800 text-center max-w-md mx-auto space-y-3">
                        <MapPin className="w-10 h-10 text-stone-400 mx-auto" />
                        <h3 className="font-serif text-lg font-bold text-stone-800 dark:text-stone-200">No districts found</h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                            Try clearing your search query to explore all 38 Tamil Nadu districts.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm('');
                            }}
                            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition-colors"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}

                {/* CUSTOM TRIP BANNER */}
                <div className="mt-16 relative overflow-hidden rounded-3xl bg-gradient-to-r from-maroon-900 via-stone-900 to-maroon-950 border border-maroon-700 p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 text-white">
                    <div className="relative z-10 max-w-xl text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-turmeric-500/20 border border-turmeric-400/40 text-amber-200 text-xs font-bold uppercase tracking-wider mb-3">
                            <Sparkles className="w-3.5 h-3.5 text-turmeric-400" />
                            <span>Custom Multi-Region Tours</span>
                        </div>
                        <h2 className="font-serif font-black text-2xl sm:text-3xl text-white">
                            Planning a multi-city Tamil Nadu journey?
                        </h2>
                        <p className="text-xs sm:text-sm text-amber-100/80 mt-2 leading-relaxed">
                            Describe your trip in natural language. Our AI structures your multi-district itinerary and verified local tour operators compete to offer you the best transparent quotes!
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <Link
                            href={route('custom-trips.create')}
                            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-turmeric-500 to-amber-400 hover:from-turmeric-400 hover:to-amber-300 text-stone-950 font-black text-xs shadow-xl shadow-turmeric-500/30 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                        >
                            <span>{t('plan_custom_trip')}</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
