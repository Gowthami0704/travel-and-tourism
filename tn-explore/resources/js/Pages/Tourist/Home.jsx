import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import AdventureBackground from '@/Components/Themes/AdventureBackground';
import DistrictCard from '@/Components/District/DistrictCard';
import { Compass, Sparkles, Search, MapPin, ChevronRight, ShieldCheck, Utensils, Heart, ArrowUpRight, ArrowRight, Flame, Layers } from 'lucide-react';
import { getImage, handleImageError, cleanName } from '@/Utils/imageFallback';

export default function Home({ districts = [], regions = [], filters = {}, featuredGems = [] }) {
    const [selectedRegion, setSelectedRegion] = useState(filters.region || 'All');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Filter districts locally for instant responsiveness
    const filteredDistricts = districts.filter((d) => {
        const matchesRegion = selectedRegion === 'All' || d.region === selectedRegion;
        const matchesSearch = searchTerm === '' ||
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesRegion && matchesSearch;
    });

    return (
        <MainLayout>
            <Head title="TN Explore | Tamil Nadu Smart Tourism" />

            {/* Hero Section with Clean Dark Adventure Background */}
            <div className="relative min-h-[560px] sm:min-h-[600px] flex items-center justify-center overflow-hidden border-b border-white/10 px-4 sm:px-6 lg:px-8 py-20">
                {/* Atmospheric Dark Adventure Mountain Canvas */}
                <AdventureBackground />

                {/* Hero Content */}
                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-7">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-900/60 via-navy-lighter/80 to-emerald-950/60 border border-emerald-500/40 text-xs font-bold tracking-wider text-emerald-300 shadow-xl backdrop-blur-md uppercase">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        <span>DISCOVER THE UNEXPLORED</span>
                    </div>

                    {/* Headline with High-Contrast Typography */}
                    <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl tracking-tight text-white leading-[1.12] drop-shadow-2xl">
                        Pick a District. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">
                            Explore Everything.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-sm sm:text-lg text-slate-200/90 max-w-2xl mx-auto leading-relaxed drop-shadow">
                        Discover temple architecture, misty hill stations, secret hidden gems, authentic culinary food trails, and verified local stays across all 38 districts of Tamil Nadu.
                    </p>

                    {/* Search & Quick Action Box */}
                    <div className="max-w-2xl mx-auto pt-2 space-y-3">
                        <div className="relative flex items-center rounded-2xl bg-[#0b1222]/90 border border-white/20 p-2 shadow-2xl shadow-black/90 backdrop-blur-xl focus-within:border-amber-400/80 transition-all">
                            <Search className="w-5 h-5 text-amber-400/80 ml-3 flex-shrink-0" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search any district (e.g. Madurai, Nilgiris, Thanjavur)..."
                                className="w-full bg-transparent border-0 text-sm text-white placeholder-slate-400 focus:ring-0 px-3 py-2.5 outline-none"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="text-xs text-slate-400 hover:text-white px-2 cursor-pointer"
                                >
                                    Clear
                                </button>
                            )}
                            <a
                                href="#districts-grid"
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                            >
                                <span>Find</span>
                                <ChevronRight className="w-4 h-4" />
                            </a>
                        </div>

                        {/* Quick AI & Planner Pills */}
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
                            <Link
                                href="/ai-guide"
                                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-gold/20 border border-gold/40 text-amber-300 hover:text-white hover:bg-gold/30 transition-all font-semibold flex items-center gap-1.5 shadow-md shadow-gold/10"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-gold" />
                                <span>Chat with TN Mitra AI Companion</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>

                            <Link
                                href="/trip-builder"
                                className="px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:text-white hover:bg-purple-500/25 transition-all font-semibold flex items-center gap-1.5"
                            >
                                <Compass className="w-3.5 h-3.5 text-purple-400" />
                                <span>Toy Trip Route Builder</span>
                            </Link>
                        </div>
                    </div>

                    {/* Live Stats Bar */}
                    <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
                        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-md hover:border-amber-400/30 transition-all">
                            <span className="font-display font-black text-2xl text-white">38</span>
                            <p className="text-[11px] text-slate-300 font-semibold tracking-wide">Districts Covered</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-md hover:border-amber-400/30 transition-all">
                            <span className="font-display font-black text-2xl text-amber-400">1,500+</span>
                            <p className="text-[11px] text-slate-300 font-semibold tracking-wide">Curated Places</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-md hover:border-amber-400/30 transition-all">
                            <span className="font-display font-black text-2xl text-emerald-400">500+</span>
                            <p className="text-[11px] text-slate-300 font-semibold tracking-wide">Authentic Dishes</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-md hover:border-amber-400/30 transition-all">
                            <span className="font-display font-black text-2xl text-cyan-400">100%</span>
                            <p className="text-[11px] text-slate-300 font-semibold tracking-wide">AI Fraud Verified</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 38 Districts Discovery Grid */}
            <div id="districts-grid" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold mb-1">
                            <Layers className="w-3.5 h-3.5" />
                            <span>District-First Marketplace</span>
                        </div>
                        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
                            Explore Tamil Nadu by District
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">
                            Showing {filteredDistricts.length} of {districts.length} districts
                        </p>
                    </div>

                    {/* Region Filter Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                        {regions.map((reg) => (
                            <button
                                key={reg}
                                type="button"
                                onClick={() => setSelectedRegion(reg)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                    selectedRegion === reg
                                        ? 'bg-gradient-to-r from-gold via-gold-light to-gold text-[#0A0E1A] shadow-md shadow-gold/20'
                                        : 'bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                {reg === 'All' ? '🌟 All Regions' : `${reg} TN`}
                            </button>
                        ))}
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
                    <div className="p-12 rounded-2xl bg-white/[0.02] border border-white/5 text-center max-w-md mx-auto space-y-3">
                        <MapPin className="w-10 h-10 text-gray-500 mx-auto" />
                        <h3 className="font-display text-lg font-bold text-white">No districts found</h3>
                        <p className="text-xs text-gray-400">
                            Try clearing your search filters to explore all 38 Tamil Nadu districts.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedRegion('All');
                                setSearchTerm('');
                            }}
                            className="px-4 py-2 rounded-xl bg-gold text-black text-xs font-bold"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
                {/* TRIP MATES HUB COMMUNITY CTA CARD */}
                <div className="mt-16 relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F172C] via-[#1A1838] to-[#0D1324] border-2 border-purple-500/40 p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Ambient Glow */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 max-w-xl text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider mb-3">
                            <Sparkles className="w-3.5 h-3.5 text-gold" />
                            <span>Community Feature • Trip Mates Hub</span>
                        </div>
                        <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
                            Looking for travel companions?
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
                            Post a trip ad, find verified travel mates across all 38 districts of Tamil Nadu, and split cabs, stays, and food costs together without last-minute cancellations!
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <Link
                            href="/trip-mates"
                            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-purple-600/30 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                        >
                            <span>Explore Trip Mates Hub</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
