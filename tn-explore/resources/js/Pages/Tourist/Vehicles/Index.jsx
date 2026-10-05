import React, { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Car,
    Filter,
    Users,
    Briefcase,
    ShieldCheck,
    CheckCircle2,
    Sliders,
    Search,
    MapPin,
    ArrowRight,
    Star,
    Sparkles,
    Check,
    X,
    Calendar
} from 'lucide-react';

export default function VehicleIndex({ vehicles = { data: [] }, districts = [], filters = {} }) {
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [selectedDistrict, setSelectedDistrict] = useState(filters.district_id || '');
    const [minSeats, setMinSeats] = useState(filters.seats || '');
    const [acFilter, setAcFilter] = useState(filters.ac || '');
    const [driverFilter, setDriverFilter] = useState(filters.with_driver || '');
    const [sortBy, setSortBy] = useState(filters.sort || 'popular');
    const [compareList, setCompareList] = useState([]);

    const applyFilters = () => {
        router.get(
            route('vehicles.index'),
            {
                type: selectedType,
                district_id: selectedDistrict,
                seats: minSeats,
                ac: acFilter,
                with_driver: driverFilter,
                sort: sortBy,
            },
            { preserveState: true }
        );
    };

    const handleToggleCompare = (vehicle) => {
        if (compareList.some((v) => v.id === vehicle.id)) {
            setCompareList(compareList.filter((v) => v.id !== vehicle.id));
        } else {
            if (compareList.length >= 3) {
                alert('You can compare up to 3 vehicles at a time.');
                return;
            }
            setCompareList([...compareList, vehicle]);
        }
    };

    const vehicleTypes = [
        { id: '', label: 'All Fleet Types' },
        { id: 'hatchback', label: 'Hatchback (3-4 Seats)' },
        { id: 'sedan', label: 'Sedan (4 Seats)' },
        { id: 'suv', label: 'SUV (6-7 Seats)' },
        { id: 'tempo_traveller', label: 'Tempo Traveller (12-20 Seats)' },
        { id: 'mini_bus', label: 'Mini Bus (21-32 Seats)' },
        { id: 'bus', label: 'Coach Bus (35-50 Seats)' },
    ];

    return (
        <MainLayout>
            <Head title="Verified Rental Fleet & Cabs in Tamil Nadu — TN Explore" />

            <div className="min-h-screen bg-[#FFFDF7] dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-8 px-4 sm:px-6 lg:px-8 space-y-8 transition-colors">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* HERO HEADER */}
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 p-8 sm:p-10 text-stone-950 shadow-2xl">
                        <div className="max-w-3xl space-y-3">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-950/10 border border-stone-950/20 text-xs font-bold uppercase tracking-wider">
                                <ShieldCheck className="w-4 h-4 text-stone-950" />
                                <span>Verified Partner Fleet & Tourist Taxis</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                                Rental Cabs, SUVs & Tempo Travellers
                            </h1>
                            <p className="text-sm sm:text-base font-medium text-stone-900/90 leading-relaxed">
                                Rent clean, verified vehicles with certified local chauffeurs across all 38 districts of Tamil Nadu. Transparent per-km rate cards and live price estimations with 0% middleman commission.
                            </p>
                        </div>
                    </div>

                    {/* FILTERS BAR */}
                    <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            {/* Type */}
                            <div>
                                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase mb-1">
                                    Vehicle Type
                                </label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold"
                                >
                                    {vehicleTypes.map((t) => (
                                        <option key={t.id} value={t.id}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* District */}
                            <div>
                                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase mb-1">
                                    District Hub
                                </label>
                                <select
                                    value={selectedDistrict}
                                    onChange={(e) => setSelectedDistrict(e.target.value)}
                                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold"
                                >
                                    <option value="">All 38 Districts</option>
                                    {districts.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Seats */}
                            <div>
                                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase mb-1">
                                    Min Seats
                                </label>
                                <select
                                    value={minSeats}
                                    onChange={(e) => setMinSeats(e.target.value)}
                                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold"
                                >
                                    <option value="">Any Seating</option>
                                    <option value="4">4+ Seats</option>
                                    <option value="6">6-7 Seats (SUV)</option>
                                    <option value="12">12+ Seats (Tempo)</option>
                                    <option value="20">20+ Seats (Bus)</option>
                                </select>
                            </div>

                            {/* Sort */}
                            <div>
                                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase mb-1">
                                    Sort By
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold"
                                >
                                    <option value="popular">Most Popular</option>
                                    <option value="price_asc">Lowest Rate (₹/day)</option>
                                    <option value="seats_desc">Maximum Seating</option>
                                </select>
                            </div>

                            {/* Apply Button */}
                            <div className="flex items-end">
                                <button
                                    type="button"
                                    onClick={applyFilters}
                                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <Filter className="w-3.5 h-3.5" />
                                    <span>Filter Fleet</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* VEHICLE CARDS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vehicles.data?.map((v) => {
                            const isComparing = compareList.some((item) => item.id === v.id);
                            return (
                                <div
                                    key={v.id}
                                    className="group rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-500/40 transition-all"
                                >
                                    <div>
                                        {/* Cover Image */}
                                        <div className="relative aspect-[16/10] bg-stone-100 dark:bg-stone-800 overflow-hidden">
                                            {v.approved_media?.[0]?.medium_path || v.approved_media?.[0]?.path ? (
                                                <img
                                                    src={v.approved_media[0].medium_path || v.approved_media[0].path}
                                                    alt={v.make_model}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                                                    <Car className="w-12 h-12" />
                                                </div>
                                            )}

                                            <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                                <span className="px-2.5 py-1 rounded-full bg-stone-950/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
                                                    {v.type?.replace('_', ' ')}
                                                </span>
                                                <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-stone-950 text-[10px] font-black flex items-center gap-1">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    Verified
                                                </span>
                                            </div>

                                            <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-stone-950/85 backdrop-blur-md text-amber-300 font-mono font-bold text-xs">
                                                from ₹{v.rates?.per_day_inr || 2800}/day
                                            </div>
                                        </div>

                                        {/* Vehicle Info */}
                                        <div className="p-6 space-y-4">
                                            <div>
                                                <h3 className="text-lg font-black text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                    {v.make_model} ({v.year})
                                                </h3>
                                                <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3.5 h-3.5 text-amber-500" />
                                                        <span>{v.seats} Seats</span>
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                                                        <span>{v.luggage_bags} Bags</span>
                                                    </span>
                                                    <span>•</span>
                                                    <span>{v.ac ? 'AC' : 'Non-AC'}</span>
                                                </div>
                                            </div>

                                            {/* Feature Chips */}
                                            {v.features?.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {v.features.slice(0, 3).map((f, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[10px] font-bold text-stone-600 dark:text-stone-300"
                                                        >
                                                            ✓ {f.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Rate breakdown preview */}
                                            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 text-xs font-mono space-y-1">
                                                <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                                                    <span>Rate per km:</span>
                                                    <strong>₹{v.rates?.per_km_inr || 14}/km</strong>
                                                </div>
                                                <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                                                    <span>Min running:</span>
                                                    <span>{v.rates?.daily_min_km || 250} km/day</span>
                                                </div>
                                            </div>

                                            {/* Partner badge */}
                                            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                                                <span className="text-stone-500 truncate max-w-[180px]">
                                                    {v.vendor?.business_name}
                                                </span>
                                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                                    ★ {Math.round((v.vendor?.trust_score || 0.92) * 100)}% Trust
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="p-6 pt-0 flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleCompare(v)}
                                            className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                                isComparing
                                                    ? 'bg-amber-500 text-stone-950 border-amber-500 font-black'
                                                    : 'border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                                            }`}
                                        >
                                            {isComparing ? 'Comparing ✓' : 'Compare'}
                                        </button>

                                        <Link
                                            href={route('vehicles.show', { id: v.id })}
                                            className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <span>Price Estimator & Details</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* COMPARISON DRAWER / MODAL */}
                    {compareList.length > 0 && (
                        <div className="fixed bottom-6 right-6 z-40 p-4 rounded-3xl bg-stone-950 text-white border border-amber-500/40 shadow-2xl space-y-3 max-w-md w-full animate-in slide-in-from-bottom-6">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <Car className="w-4 h-4" />
                                    Compare Vehicles ({compareList.length}/3)
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setCompareList([])}
                                    className="p-1 text-stone-400 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {compareList.map((c) => (
                                    <div key={c.id} className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-[11px] space-y-1">
                                        <strong className="block truncate text-white">{c.make_model}</strong>
                                        <span className="text-amber-400 font-mono font-bold block">₹{c.rates?.per_day_inr}/d</span>
                                        <span className="text-[10px] text-stone-400">{c.seats} seats • ₹{c.rates?.per_km_inr}/km</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
