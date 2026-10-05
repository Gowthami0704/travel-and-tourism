import React, { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Package,
    ShieldCheck,
    Calendar,
    Filter,
    Users,
    Star,
    ArrowRight,
    MapPin,
    Clock,
    Sparkles,
    CheckCircle2
} from 'lucide-react';

export default function PackageIndex({ packages = { data: [] }, districts = [], filters = {} }) {
    const [selectedDistrict, setSelectedDistrict] = useState(filters.district_id || '');
    const [selectedDuration, setSelectedDuration] = useState(filters.duration || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');

    const applyFilters = () => {
        router.get(
            route('packages.index'),
            {
                district_id: selectedDistrict,
                duration: selectedDuration,
                category: selectedCategory,
            },
            { preserveState: true }
        );
    };

    return (
        <MainLayout>
            <Head title="Verified Tour Packages in Tamil Nadu — TN Explore" />

            <div className="min-h-screen bg-[#FFFDF7] dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 p-8 sm:p-10 text-stone-950 shadow-2xl">
                        <div className="max-w-3xl space-y-3">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-950/10 border border-stone-950/20 text-xs font-bold uppercase tracking-wider">
                                <ShieldCheck className="w-4 h-4 text-stone-950" />
                                <span>Verified Regional Operators</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                                Handcrafted Tamil Nadu Tour Packages
                            </h1>
                            <p className="text-sm sm:text-base font-medium text-stone-900/90 leading-relaxed">
                                Curated holiday circuits, Chola architectural walks, misty hill station stays, and temple trail departures with licensed local guides and transparent per-person pricing.
                            </p>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase mb-1">
                                    Destination District
                                </label>
                                <select
                                    value={selectedDistrict}
                                    onChange={(e) => setSelectedDistrict(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold"
                                >
                                    <option value="">All 38 Districts</option>
                                    {districts.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase mb-1">
                                    Duration
                                </label>
                                <select
                                    value={selectedDuration}
                                    onChange={(e) => setSelectedDuration(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold"
                                >
                                    <option value="">Any Duration</option>
                                    <option value="1">Day Tours (1 Day)</option>
                                    <option value="3">Weekend Breaks (2-3 Days)</option>
                                    <option value="5">Heritage Circuit (4-6 Days)</option>
                                    <option value="7">Grand Tamil Nadu (7+ Days)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase mb-1">
                                    Travel Theme
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold"
                                >
                                    <option value="">All Themes</option>
                                    <option value="Heritage">Temple & Heritage</option>
                                    <option value="Nature">Western Ghats & Nature</option>
                                    <option value="Culinary">Food & Cultural Walk</option>
                                    <option value="Adventure">Adventure & Jeep Safari</option>
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    type="button"
                                    onClick={applyFilters}
                                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <Filter className="w-3.5 h-3.5" />
                                    <span>Filter Packages</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Packages Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.data?.map((pkg) => (
                            <Link
                                key={pkg.id}
                                href={route('packages.show', { id: pkg.id })}
                                className="group rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-500/40 transition-all"
                            >
                                <div>
                                    <div className="relative aspect-[16/10] bg-stone-100 dark:bg-stone-800 overflow-hidden">
                                        <img
                                            src={pkg.image_url || 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600'}
                                            alt={pkg.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                            <span className="px-2.5 py-1 rounded-full bg-stone-950/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
                                                {pkg.duration_days || 3} Days
                                            </span>
                                            <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-stone-950 text-[10px] font-black">
                                                Verified
                                            </span>
                                        </div>
                                        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-stone-950/85 backdrop-blur-md text-amber-300 font-mono font-bold text-xs">
                                            from ₹{pkg.price_per_person || pkg.price}/person
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-3">
                                        <h3 className="text-base font-black text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                                            {pkg.title}
                                        </h3>
                                        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                                            {pkg.description}
                                        </p>
                                        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                                            <span className="text-stone-500">{pkg.vendor?.business_name}</span>
                                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">★ 4.9</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 pt-0">
                                    <div className="w-full py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 group-hover:bg-amber-500 group-hover:text-stone-950 text-stone-800 dark:text-stone-200 text-xs font-black transition-all flex items-center justify-center gap-1">
                                        <span>View Itinerary & Dates</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
